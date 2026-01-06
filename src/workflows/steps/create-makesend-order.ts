/**
 * Create Makesend Order Step
 * Creates a Makesend order/shipment with the given data
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import {
    CreateOrderRequest,
    CreateOrderShipment,
    Temperature,
    ParcelSize,
    ParcelType,
    PickupType,
    PickupTimeSlot,
} from "../../providers/makesend/types"
import { MakesendClient } from "../../providers/makesend/client"
import { getLocationFromPostalCode } from "../../providers/makesend/postal-code-lookup"
import { getProvinceId } from "../../providers/makesend/province-mapping"

export type CreateMakesendOrderInput = {
    // API credentials
    apiKey: string
    baseUrl?: string
    trackingBaseUrl?: string
    labelBaseUrl?: string

    // Stock location data
    stockLocation: {
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

    // Fulfillment data
    fulfillmentId: string
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

export type CreateMakesendOrderResult = {
    orderId: string
    trackingId: string
    aliasId: string
    deliveryFee: number,
    baseUrl?: string
    trackingBaseUrl?: string
    labelBaseUrl?: string
}

/**
 * Get delivery date (next business day)
 */
function getDeliveryDate(): string {
    const now = new Date()
    const currentHour = now.getHours()
    let targetDate = new Date(now)

    // If after 10 AM, move to next day
    if (currentHour >= 10) {
        targetDate.setDate(targetDate.getDate() + 1)
    }

    // Skip Sunday
    if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1)
    }

    return targetDate.toISOString().split("T")[0]
}

export const createMakesendOrderStep = createStep(
    "create-makesend-order",
    async (input: CreateMakesendOrderInput) => {

        // Initialize Makesend client
        const client = new MakesendClient({
            apiKey: input.apiKey,
            baseUrl: input.baseUrl,
        })

        // Build sender info from stock location
        let senderName = "Sender"
        let senderPhone = ""
        let pickupAddress = ""
        let pickupPostcode = ""
        let pickupProvince = 1
        let pickupDistrict = 1

        const stockAddr = input.stockLocation.address
        if (stockAddr) {
            senderName = stockAddr.company || input.stockLocation.name || "Sender"
            senderPhone = stockAddr.phone || ""
            pickupAddress = [
                stockAddr.address_1,
                stockAddr.address_2,
                stockAddr.city,
            ].filter(Boolean).join(" ")
            pickupPostcode = stockAddr.postal_code || ""

            // Get province/district from postal code
            if (pickupPostcode) {
                const location = getLocationFromPostalCode(pickupPostcode)
                if (location.provinceId) {
                    pickupProvince = location.provinceId
                    pickupDistrict = location.districtId || location.provinceId
                }
            }

            // Fallback to province name
            if (pickupProvince === 1 && stockAddr.province) {
                pickupProvince = getProvinceId(stockAddr.province) || 1
            }
        }

        // Build destination info
        let dropProvince = 1
        let dropDistrict = 1
        const destPostcode = input.deliveryAddress.postal_code || ""
        if (destPostcode) {
            const location = getLocationFromPostalCode(destPostcode)
            if (location.provinceId) {
                dropProvince = location.provinceId
                dropDistrict = location.districtId || location.provinceId
            }
        }

        // Build shipment
        const shipment: CreateOrderShipment = {
            parcelSize: input.parcelSize || ParcelSize.S80,
            parcelType: input.parcelType || ParcelType.OTHER,
            receiverName: [
                input.deliveryAddress.first_name,
                input.deliveryAddress.last_name
            ].filter(Boolean).join(" ") || "Customer",
            receiverPhone: input.deliveryAddress.phone || "",
            dropAddress: [
                input.deliveryAddress.address_1,
                input.deliveryAddress.address_2,
            ].filter(Boolean).join(" ") || "",
            dropProvince,
            dropDistrict,
            dropPostcode: destPostcode,
            cod: 0,
            temp: input.temperature ?? Temperature.NORMAL,
            note: input.note || "",
            aliasID: input.fulfillmentId,
        }

        // Build request
        const request: CreateOrderRequest = {
            deliveryDate: getDeliveryDate(),
            senderName,
            senderPhone,
            pickupAddress,
            pickupProvince,
            pickupDistrict,
            pickupPostcode,
            pickupType: PickupType.PICKUP_AT_SENDER,
            branch: 0,
            pickupTime: PickupTimeSlot.SLOT_10_12,
            shipment: [shipment],
        }

        try {
            // Create order
            const response = await client.createOrder(request)

            const firstShipment = response.shipment[0]

            const result: CreateMakesendOrderResult = {
                orderId: response.orderID,
                trackingId: firstShipment.trackingID,
                aliasId: firstShipment.aliasID,
                deliveryFee: firstShipment.deliveryFee,
                baseUrl: input.baseUrl,
                trackingBaseUrl: input.trackingBaseUrl,
                labelBaseUrl: input.labelBaseUrl,
            }
            return new StepResponse(result, result.orderId)
        } catch (error: any) {
            console.error(`[Makesend] Failed to create order: ${error.message}`)
            throw new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                `Failed to create Makesend order: ${error.message}`
            )
        }
    },
    // Compensation - cancel order on rollback
    async (orderId) => {
        if (!orderId) return

        console.warn(`[Makesend] Rollback requested for order ${orderId} - cancellation not implemented`)
        // TODO: Implement order cancellation if Makesend API supports it
    }
)
