/**
 * Makesend Parcel Size Update Webhook Handler
 * Receives parcel size adjustments from Makesend
 * 
 * @see POST /store/makesend/webhook/parcel-size
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Webhook payload from Makesend parcel size update
 */
interface ParcelSizeUpdateWebhookPayload {
    trackingID: string
    aliasID: string
    sizeID: number
    sizeCode: string
    sizeName: string
    extraFee: number // In Satang
    datetime: string
}

/**
 * POST /store/makesend/webhook/parcel-size
 * 
 * Receives parcel size update notifications from Makesend
 * Sent when shipment reaches terminal status and size was adjusted
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const logger = req.scope.resolve("logger") as { info: Function; warn: Function; error: Function }

    try {
        const payload = req.body as ParcelSizeUpdateWebhookPayload

        logger.info(`[Makesend Webhook] Parcel size update received: ${JSON.stringify({
            trackingID: payload.trackingID,
            aliasID: payload.aliasID,
            sizeID: payload.sizeID,
            sizeCode: payload.sizeCode,
            sizeName: payload.sizeName,
            extraFee: payload.extraFee,
            datetime: payload.datetime,
        })}`)

        // Log if there's an extra fee due to size difference
        if (payload.extraFee > 0) {
            const extraFeeInBaht = payload.extraFee / 100
            logger.warn(
                `[Makesend] Shipment ${payload.trackingID} has extra fee of ${extraFeeInBaht} Baht due to parcel size adjustment to ${payload.sizeCode} (${payload.sizeName})`
            )
            // TODO: Store extra fee information for billing reconciliation
        }

        res.status(200).json({
            success: true,
            message: "Webhook received",
            trackingID: payload.trackingID,
        })
    } catch (error) {
        logger.error(`[Makesend Webhook] Error processing parcel size update: ${error}`)

        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}
