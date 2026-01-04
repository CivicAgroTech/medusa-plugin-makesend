/**
 * Makesend Create Fulfillment Workflow
 * 
 * This workflow enriches fulfillment data with stock location address
 * before creating the fulfillment through the Makesend provider.
 */

import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse,
    transform,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

// Types for workflow input
type MakesendFulfillmentInput = {
    location_id: string
    provider_id: string
    shipping_option_id: string
    items: {
        title: string
        sku: string
        quantity: number
        barcode: string
        line_item_id?: string
        inventory_item_id?: string
    }[]
    delivery_address: {
        first_name?: string
        last_name?: string
        company?: string
        address_1: string
        address_2?: string
        city?: string
        country_code: string
        province?: string
        postal_code?: string
        phone?: string
    }
    metadata?: Record<string, unknown>
}

type StockLocationData = {
    location_id: string
    name?: string
    address?: {
        address_1?: string
        address_2?: string
        city?: string
        province?: string
        postal_code?: string
        phone?: string
        company?: string
        country_code?: string
    }
}

type SenderData = {
    name: string
    phone: string
    address: string
    postcode: string
}

/**
 * Step 1: Fetch stock location with address
 */
const fetchStockLocationStep = createStep(
    "fetch-stock-location-for-makesend",
    async (input: { location_id: string }, { container }) => {
        const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

        try {
            const location = await stockLocationService.retrieveStockLocation(
                input.location_id,
                { relations: ["address"] }
            )

            const result: StockLocationData = {
                location_id: location.id,
                name: location.name,
                address: location.address ? {
                    address_1: location.address.address_1,
                    address_2: location.address.address_2 ?? undefined,
                    city: location.address.city ?? undefined,
                    province: location.address.province ?? undefined,
                    postal_code: location.address.postal_code ?? undefined,
                    phone: location.address.phone ?? undefined,
                    company: location.address.company ?? undefined,
                    country_code: location.address.country_code,
                } : undefined,
            }

            return new StepResponse(result)
        } catch (error) {
            console.warn(`[Makesend] Failed to fetch stock location: ${error}`)
            return new StepResponse({
                location_id: input.location_id,
                name: undefined,
                address: undefined,
            } as StockLocationData)
        }
    }
)

/**
 * Step 2: Create the fulfillment via Medusa's fulfillment module
 */
const createMakesendFulfillmentStep = createStep(
    "create-makesend-fulfillment",
    async (
        input: {
            fulfillmentInput: MakesendFulfillmentInput
            senderData: SenderData
        },
        { container }
    ) => {
        const fulfillmentService = container.resolve(Modules.FULFILLMENT)

        // Include sender data in the fulfillment data
        const fulfillmentData = {
            ...input.fulfillmentInput.metadata,
            sender: input.senderData,
        }

        const fulfillment = await fulfillmentService.createFulfillment({
            location_id: input.fulfillmentInput.location_id,
            provider_id: input.fulfillmentInput.provider_id,
            delivery_address: input.fulfillmentInput.delivery_address,
            items: input.fulfillmentInput.items,
            labels: [],
            order: {},
            data: fulfillmentData,
        })

        return new StepResponse({ fulfillment }, fulfillment.id)
    },
    // Compensation function to rollback on failure
    async (fulfillmentId, { container }) => {
        if (!fulfillmentId) {
            return
        }
        const fulfillmentService = container.resolve(Modules.FULFILLMENT)
        await fulfillmentService.cancelFulfillment(fulfillmentId)
    }
)

/**
 * Main workflow: Create Makesend Fulfillment
 * 
 * This workflow:
 * 1. Fetches the stock location address
 * 2. Prepares enriched data with sender/pickup information
 * 3. Creates the fulfillment with the Makesend provider
 */
export const createMakesendFulfillmentWorkflow = createWorkflow(
    "create-makesend-fulfillment",
    (input: MakesendFulfillmentInput) => {
        // Step 1: Fetch stock location
        const stockLocation = fetchStockLocationStep({
            location_id: input.location_id
        })

        // Step 2: Transform stock location to sender data
        const senderData = transform(
            { stockLocation },
            (data) => {
                const loc = data.stockLocation
                if (loc?.address) {
                    return {
                        name: loc.address.company || loc.name || "Sender",
                        phone: loc.address.phone || "",
                        address: [
                            loc.address.address_1,
                            loc.address.address_2,
                            loc.address.city,
                            loc.address.province,
                        ].filter(Boolean).join(" "),
                        postcode: loc.address.postal_code || "",
                    }
                }
                return {
                    name: "Sender",
                    phone: "",
                    address: "",
                    postcode: "",
                }
            }
        )

        // Step 3: Create fulfillment
        const { fulfillment } = createMakesendFulfillmentStep({
            fulfillmentInput: input,
            senderData,
        })

        return new WorkflowResponse({
            fulfillment,
        })
    }
)

export default createMakesendFulfillmentWorkflow
