/**
 * Create Makesend Shipment Workflow
 * 
 * Main workflow for creating a Makesend shipment.
 * Fetches stock location address and creates the order.
 */

import {
    createWorkflow,
    WorkflowResponse,
    transform,
} from "@medusajs/framework/workflows-sdk"
import { fetchStockLocationStep, StockLocationResult } from "./steps/fetch-stock-location"
import { fetchShippingOptionStep, ShippingOptionResult } from "./steps/fetch-shipping-option"
import { createMakesendOrderStep, CreateMakesendOrderResult } from "./steps/create-makesend-order"

export type CreateMakesendShipmentInput = {
    // API credentials
    apiKey: string
    baseUrl?: string
    trackingBaseUrl?: string
    labelBaseUrl?: string

    // Fulfillment info
    locationId: string
    fulfillmentId: string
    shippingOptionId: string

    // Delivery address
    deliveryAddress: {
        first_name?: string
        last_name?: string
        company?: string
        address_1?: string
        address_2?: string
        city?: string
        province?: string
        postal_code?: string
        phone?: string
        country_code?: string
    }

    // Options
    temperature?: number
    parcelSize?: number
    parcelType?: string
    note?: string
}

export type CreateMakesendShipmentResult = {
    orderId: string
    trackingId: string
    aliasId: string
    deliveryFee: number
}

export const createMakesendShipmentWorkflow = createWorkflow(
    "create-makesend-shipment",
    (input: CreateMakesendShipmentInput) => {
        // Step 1: Fetch stock location with address
        const stockLocation = fetchStockLocationStep({
            location_id: input.locationId,
        })

        // Step 2: Fetch shipping option to get temperature
        const shippingOptionData = fetchShippingOptionStep({
            shipping_option_id: input.shippingOptionId,
        })

        // Step 3: Transform to build order input
        const orderInput = transform(
            { input, stockLocation, shippingOptionData },
            (data) => ({
                apiKey: data.input.apiKey,
                baseUrl: data.input.baseUrl,
                trackingBaseUrl: data.input.trackingBaseUrl,
                labelBaseUrl: data.input.labelBaseUrl,
                stockLocation: data.stockLocation as StockLocationResult,
                fulfillmentId: data.input.fulfillmentId,
                deliveryAddress: data.input.deliveryAddress,
                // Use temperature from shipping option, fallback to input
                temperature: (data.shippingOptionData as ShippingOptionResult).temperature ?? data.input.temperature,
                parcelSize: data.input.parcelSize,
                parcelType: data.input.parcelType,
                note: data.input.note,
            })
        )

        // Step 4: Create Makesend order
        const orderResult = createMakesendOrderStep(orderInput)

        // Return result
        const result = transform(
            { orderResult },
            (data) => data.orderResult as CreateMakesendOrderResult
        )

        return new WorkflowResponse(result)
    }
)

export default createMakesendShipmentWorkflow
