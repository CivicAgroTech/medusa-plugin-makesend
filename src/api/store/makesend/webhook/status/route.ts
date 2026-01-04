/**
 * Makesend Status Update Webhook Handler
 * Receives status updates from Makesend
 * 
 * @see POST /store/makesend/webhook/status
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Shipment Status Codes from Makesend
 */
const ShipmentStatusCode = {
    PENDING: "PENDING",
    SHIPPED: "SHIPPED",
    ARRIVED_HUB: "ARRIVED_HUB",
    SORTED: "SORTED",
    NOT_FOUND: "NOT_FOUND",
    ROTATING: "ROTATING",
    DELIVERING: "DELIVERING",
    DELIVERED: "DELIVERED",
    DELIVERING_DELAY: "DELIVERING_DELAY",
    DELIVERED_DELAY: "DELIVERED_DELAY",
    DELIVERY_FAILED: "DELIVERY_FAILED",
    DELIVERING_RE: "DELIVERING_RE",
    DELIVERED_RE: "DELIVERED_RE",
    RETURNED: "RETURNED",
    RETURNING: "RETURNING",
    CANCELED: "CANCELED",
} as const

/**
 * Webhook payload from Makesend status update
 */
interface StatusUpdateWebhookPayload {
    trackingID: string
    aliasID: string
    statusID: number
    statusCode: string
    statusName: string
    datetime: string
}

/**
 * POST /store/makesend/webhook/status
 * 
 * Receives shipment status updates from Makesend webhook
 * Updates fulfillment status in Medusa based on status codes
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const logger = req.scope.resolve("logger") as { info: Function; warn: Function; error: Function }

    try {
        const payload = req.body as StatusUpdateWebhookPayload

        logger.info(`[Makesend Webhook] Status update received: ${JSON.stringify({
            trackingID: payload.trackingID,
            aliasID: payload.aliasID,
            statusCode: payload.statusCode,
            statusID: payload.statusID,
            datetime: payload.datetime,
        })}`)

        // Map Makesend status to fulfillment action
        const statusCode = payload.statusCode

        switch (statusCode) {
            case ShipmentStatusCode.PENDING:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is pending`)
                break

            case ShipmentStatusCode.SHIPPED:
            case ShipmentStatusCode.DELIVERING:
            case ShipmentStatusCode.DELIVERING_RE:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is in transit`)
                // TODO: Update fulfillment shipment status in Medusa
                break

            case ShipmentStatusCode.DELIVERED:
            case ShipmentStatusCode.DELIVERED_RE:
            case ShipmentStatusCode.DELIVERED_DELAY:
                logger.info(`[Makesend] Shipment ${payload.trackingID} has been delivered`)
                // TODO: Mark fulfillment as delivered in Medusa
                break

            case ShipmentStatusCode.DELIVERY_FAILED:
                logger.warn(`[Makesend] Shipment ${payload.trackingID} delivery failed`)
                // TODO: Handle delivery failure
                break

            case ShipmentStatusCode.CANCELED:
                logger.info(`[Makesend] Shipment ${payload.trackingID} was cancelled`)
                // TODO: Handle cancellation
                break

            case ShipmentStatusCode.RETURNED:
            case ShipmentStatusCode.RETURNING:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is being returned`)
                // TODO: Handle return
                break

            default:
                logger.info(`[Makesend] Shipment ${payload.trackingID} status: ${statusCode}`)
        }

        res.status(200).json({
            success: true,
            message: "Webhook received",
            trackingID: payload.trackingID,
        })
    } catch (error) {
        logger.error(`[Makesend Webhook] Error processing status update: ${error}`)

        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}
