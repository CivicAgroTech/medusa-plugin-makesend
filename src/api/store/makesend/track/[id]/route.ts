/**
 * Makesend Tracking API Route
 * Retrieves tracking information for a shipment
 * 
 * @see GET /store/makesend/track/:id
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Makesend API base URL
 */
const MAKESEND_API_URL = "https://apis.makesend.asia/oapi/api"

/**
 * GET /store/makesend/track/:id
 * 
 * Retrieves tracking information for a shipment from Makesend API
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const logger = req.scope.resolve("logger") as { info: Function; error: Function }

    try {
        const trackingId = req.params.id

        if (!trackingId) {
            return res.status(400).json({
                error: "Tracking ID is required",
            })
        }

        // Get API key from plugin options or environment
        const apiKey = process.env.MAKESEND_API_KEY

        if (!apiKey) {
            logger.error("[Makesend] API key not configured")
            return res.status(500).json({
                error: "Makesend API key not configured",
            })
        }

        // Call Makesend tracking API
        const response = await fetch(`${MAKESEND_API_URL}/order/tracking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ms-key": apiKey,
            },
            body: JSON.stringify({ trackingID: trackingId }),
        })

        const data = await response.json()

        if (data.resCode !== 200) {
            logger.error(`[Makesend] Tracking API error: ${data.message}`)
            return res.status(data.resCode === 403 ? 403 : 404).json({
                error: data.message || "Failed to fetch tracking information",
            })
        }

        logger.info(`[Makesend] Tracking info retrieved for ${trackingId}`)

        res.status(200).json(data)
    } catch (error) {
        logger.error(`[Makesend] Tracking error: ${error}`)

        res.status(500).json({
            error: "Failed to fetch tracking information",
        })
    }
}
