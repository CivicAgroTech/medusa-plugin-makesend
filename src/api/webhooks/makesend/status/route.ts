/**
 * Makesend Status Update Webhook Handler
 * Receives status updates from Makesend
 * 
 * @see POST /store/makesend/webhook/status
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
    updateFulfillmentWorkflow,
    markFulfillmentAsDeliveredWorkflow,
    createShipmentWorkflow
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { json } from "node:stream/consumers"

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
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    try {
        const payload = req.body as StatusUpdateWebhookPayload

        logger.info(`[Makesend Webhook] Status update received: ${JSON.stringify({
            trackingID: payload.trackingID,
            aliasID: payload.aliasID,
            statusCode: payload.statusCode,
            statusID: payload.statusID,
            datetime: payload.datetime,
        })}`)

        // Find fulfillment by tracking ID in the data field
        const { data: fulfillments } = await query.graph({
            entity: "fulfillment",
            fields: ["id", "data", "shipped_at", "delivered_at"],
            filters: {
                data: {
                    trackingNumber: payload.trackingID
                }
            }
        })

        if (!fulfillments || fulfillments.length === 0) {
            // Try finding by aliasID if trackingID doesn't match
            const { data: fulfillmentsByAlias } = await query.graph({
                entity: "fulfillment",
                fields: ["id", "data", "shipped_at", "delivered_at"],
                filters: {
                    data: {
                        aliasId: payload.aliasID
                    }
                }
            })

            if (!fulfillmentsByAlias || fulfillmentsByAlias.length === 0) {
                logger.warn(`[Makesend Webhook] No fulfillment found for tracking ID: ${payload.trackingID} or alias ID: ${payload.aliasID}`)
                return res.status(200).json({
                    success: true,
                    message: "Webhook received but no matching fulfillment found",
                    trackingID: payload.trackingID,
                })
            }

            fulfillments.push(...fulfillmentsByAlias)
        }

        // Map Makesend status to fulfillment action
        const statusCode = payload.statusCode
        const fulfillmentId = fulfillments[0].id

        switch (statusCode) {
            case ShipmentStatusCode.PENDING:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is pending`)
                break

            case ShipmentStatusCode.SHIPPED:
                logger.info(`[Makesend] Shipment ${payload.trackingID} has been shipped`)

                // Mark fulfillment as shipped if not already shipped
                if (!fulfillments[0].shipped_at) {
                    // Use createShipmentWorkflow which emits order.fulfillment_shipped event automatically
                    await updateFulfillmentWorkflow(req.scope).run({
                        input: {
                            id: fulfillmentId,
                            shipped_at: new Date(payload.datetime),
                            data: {
                                ...fulfillments[0].data,
                                makesend_status: statusCode,
                                makesend_updated_at: payload.datetime
                            }
                        }
                    })
                } else {
                    // Update tracking data only
                    await updateFulfillmentWorkflow(req.scope).run({
                        input: {
                            id: fulfillmentId,
                            data: {
                                ...fulfillments[0].data,
                                makesend_status: statusCode,
                                makesend_updated_at: payload.datetime
                            }
                        }
                    })
                }
                break

            case ShipmentStatusCode.DELIVERING:
            case ShipmentStatusCode.DELIVERING_RE:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is out for delivery`)

                // Update tracking data only (shipment already created)
                await updateFulfillmentWorkflow(req.scope).run({
                    input: {
                        id: fulfillmentId,
                        data: {
                            ...fulfillments[0].data,
                            makesend_status: statusCode,
                            makesend_updated_at: payload.datetime
                        }
                    }
                })

                logger.info(`[Makesend] Updated fulfillment ${fulfillmentId} delivery status`)
                break

            case ShipmentStatusCode.DELIVERED:
            case ShipmentStatusCode.DELIVERED_RE:
            case ShipmentStatusCode.DELIVERED_DELAY:
                logger.info(`[Makesend] Shipment ${payload.trackingID} has been delivered`)
                logger.info(`[Makesend] Processing delivery for fulfillments ${JSON.stringify(fulfillments)}`)

                // Mark fulfillment as delivered if not already delivered
                if (!fulfillments[0].delivered_at) {
                    // markFulfillmentAsDeliveredWorkflow emits order.fulfillment_delivered event automatically
                    await markFulfillmentAsDeliveredWorkflow(req.scope).run({
                        input: {
                            id: fulfillmentId,
                        }
                    })

                    logger.info(`[Makesend] Marked fulfillment ${fulfillmentId} as delivered and emitted event`)
                } else {
                    // Update tracking data only
                    await updateFulfillmentWorkflow(req.scope).run({
                        input: {
                            id: fulfillmentId,
                            data: {
                                ...fulfillments[0].data,
                                makesend_status: statusCode,
                                makesend_updated_at: payload.datetime
                            }
                        }
                    })
                }
                break

            case ShipmentStatusCode.DELIVERY_FAILED:
                logger.warn(`[Makesend] Shipment ${payload.trackingID} delivery failed`)

                // Update tracking data with failure info
                await updateFulfillmentWorkflow(req.scope).run({
                    input: {
                        id: fulfillmentId,
                        data: {
                            ...fulfillments[0].data,
                            makesend_status: statusCode,
                            makesend_updated_at: payload.datetime,
                            delivery_failure_reason: "Delivery failed as reported by Makesend"
                        }
                    }
                })

                logger.info(`[Makesend] Updated fulfillment ${fulfillmentId} with delivery failure`)
                break

            case ShipmentStatusCode.CANCELED:
                logger.info(`[Makesend] Shipment ${payload.trackingID} was cancelled`)

                // Update tracking data with cancellation info
                await updateFulfillmentWorkflow(req.scope).run({
                    input: {
                        id: fulfillmentId,
                        data: {
                            ...fulfillments[0].data,
                            makesend_status: statusCode,
                            makesend_updated_at: payload.datetime,
                            cancellation_reason: "Cancelled by Makesend"
                        }
                    }
                })

                logger.info(`[Makesend] Updated fulfillment ${fulfillmentId} with cancellation`)
                break

            case ShipmentStatusCode.RETURNED:
            case ShipmentStatusCode.RETURNING:
                logger.info(`[Makesend] Shipment ${payload.trackingID} is being returned`)

                // Update tracking data with return info
                await updateFulfillmentWorkflow(req.scope).run({
                    input: {
                        id: fulfillmentId,
                        data: {
                            ...fulfillments[0].data,
                            makesend_status: statusCode,
                            makesend_updated_at: payload.datetime,
                            return_reason: "Package returned via Makesend"
                        }
                    }
                })

                logger.info(`[Makesend] Updated fulfillment ${fulfillmentId} with return status`)
                break

            default:
                logger.info(`[Makesend] Shipment ${payload.trackingID} status: ${statusCode}`)

                // Update tracking data for other statuses
                await updateFulfillmentWorkflow(req.scope).run({
                    input: {
                        id: fulfillmentId,
                        data: {
                            ...fulfillments[0].data,
                            makesend_status: statusCode,
                            makesend_updated_at: payload.datetime
                        }
                    }
                })
        }

        res.status(200).json({
            success: true,
            message: "Webhook received and fulfillment updated",
            trackingID: payload.trackingID,
            fulfillmentId: fulfillmentId,
            status: statusCode
        })
    } catch (error) {
        logger.error(`[Makesend Webhook] Error processing status update: ${error}`)

        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}
