/**
 * Fetch Stock Location Step
 * Fetches stock location with address from Medusa
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type FetchStockLocationInput = {
    location_id: string
}

export type StockLocationResult = {
    id: string
    name: string
    address?: {
        company?: string
        address_1?: string
        address_2?: string
        city?: string
        province?: string
        postal_code?: string
        phone?: string
        country_code?: string
    }
}

export const fetchStockLocationStep = createStep(
    "fetch-stock-location-for-makesend",
    async (input: FetchStockLocationInput, { container }) => {
        const stockLocationService = container.resolve(Modules.STOCK_LOCATION)

        try {
            const location = await stockLocationService.retrieveStockLocation(
                input.location_id,
                { relations: ["address"] }
            )

            const result: StockLocationResult = {
                id: location.id,
                name: location.name,
                address: location.address ? {
                    company: location.address.company ?? undefined,
                    address_1: location.address.address_1 ?? undefined,
                    address_2: location.address.address_2 ?? undefined,
                    city: location.address.city ?? undefined,
                    province: location.address.province ?? undefined,
                    postal_code: location.address.postal_code ?? undefined,
                    phone: location.address.phone ?? undefined,
                    country_code: location.address.country_code ?? undefined,
                } : undefined,
            }

            return new StepResponse(result)
        } catch (error) {
            console.error(`[Makesend] Failed to fetch stock location: ${error}`)
            // Return empty result - provider will use fallback
            return new StepResponse({
                id: input.location_id,
                name: "",
                address: undefined,
            } as StockLocationResult)
        }
    }
)
