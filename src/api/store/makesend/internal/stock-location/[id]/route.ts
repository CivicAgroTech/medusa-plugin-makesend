/**
 * Internal Stock Location API Route (No Auth Required)
 * Used by the Makesend fulfillment provider to fetch stock location address
 * 
 * @see GET /store/makesend/internal/stock-location/:id
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/makesend/internal/stock-location/:id
 * Fetch stock location with address - internal use only
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                error: "Stock location ID is required",
            })
        }

        // Resolve stock location service from container
        const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION)

        // Fetch stock location with address
        const stockLocation = await stockLocationService.retrieveStockLocation(id, {
            relations: ["address"],
        })

        if (!stockLocation) {
            return res.status(404).json({
                error: "Stock location not found",
            })
        }

        // Return only the fields needed by the fulfillment provider
        res.status(200).json({
            stock_location: {
                id: stockLocation.id,
                name: stockLocation.name,
                address: stockLocation.address ? {
                    company: stockLocation.address.company,
                    address_1: stockLocation.address.address_1,
                    address_2: stockLocation.address.address_2,
                    city: stockLocation.address.city,
                    province: stockLocation.address.province,
                    postal_code: stockLocation.address.postal_code,
                    phone: stockLocation.address.phone,
                    country_code: stockLocation.address.country_code,
                } : null,
            },
        })
    } catch (error) {
        console.error("[Makesend] Failed to fetch stock location:", error)

        res.status(500).json({
            error: "Failed to fetch stock location",
        })
    }
}
