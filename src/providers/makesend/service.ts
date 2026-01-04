/**
 * Makesend Fulfillment Provider Service
 * Implements AbstractFulfillmentProviderService for MedusaJS v2
 */

import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import { createMakesendShipmentWorkflow } from "../../workflows"
import {
    Logger,
    FulfillmentOption,
    CreateFulfillmentResult,
    CalculatedShippingOptionPrice,
    CreateShippingOptionDTO,
    CalculateShippingOptionPriceDTO,
    FulfillmentItemDTO,
    FulfillmentOrderDTO,
    FulfillmentDTO,
} from "@medusajs/framework/types"
import { MakesendClient, MakesendApiError } from "./client"
import {
    MakesendProviderOptions,
    MakesendFulfillmentData,
    CalculateFeeRequest,
    Temperature,
    ParcelSize,
    ParcelType,
} from "./types"
import { getProvinceId } from "./province-mapping"
import { getLocationFromPostalCode } from "./postal-code-lookup"

type InjectedDependencies = {
    logger: Logger
}

/**
 * Makesend Fulfillment Provider
 * Integrates Makesend logistics services with MedusaJS v2
 */
class MakesendFulfillmentProviderService extends AbstractFulfillmentProviderService {
    static identifier = "makesend"

    protected logger_: Logger
    protected options_: MakesendProviderOptions
    protected client_: MakesendClient

    constructor(
        { logger }: InjectedDependencies,
        options: MakesendProviderOptions
    ) {
        super()
        this.logger_ = logger
        this.options_ = options
        this.client_ = new MakesendClient(options)
    }

    /**
     * Returns the available fulfillment options for Makesend
     * These options represent different shipping types/temperatures
     */
    async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
        // Only use parcel sizes 6 (S80) and 7 (S100) as configured
        const allowedParcelSizes = [ParcelSize.S80, ParcelSize.S100]

        return [
            {
                id: "makesend-standard",
                name: "Makesend Standard Delivery",
                temperature: Temperature.NORMAL,
                parcelSizes: allowedParcelSizes,
            },
            {
                id: "makesend-chill",
                name: "Makesend Chill Delivery",
                temperature: Temperature.CHILL,
                parcelSizes: allowedParcelSizes,
            },
            {
                id: "makesend-frozen",
                name: "Makesend Frozen Delivery",
                temperature: Temperature.FROZEN,
                parcelSizes: allowedParcelSizes,
            },
        ]
    }

    /**
     * Validates fulfillment data when a fulfillment is created
     * Returns the data that will be stored with the fulfillment
     */
    async validateFulfillmentData(
        optionData: Record<string, unknown>,
        data: Record<string, unknown>,
        context: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        // Extract and validate required fields from data
        const temperature = (optionData.temperature as number) ?? Temperature.NORMAL
        const validatedData: Record<string, unknown> = {
            temperature,
            parcelSize: data.parcelSize ?? ParcelSize.S80,
            parcelType: data.parcelType ?? ParcelType.OTHER,
        }

        // Validate parcel size is within allowed range (6 or 7)
        const parcelSize = validatedData.parcelSize as number
        if (parcelSize !== ParcelSize.S80 && parcelSize !== ParcelSize.S100) {
            throw new Error(`Invalid parcel size: ${parcelSize}. Must be 6 (S80) or 7 (S100).`)
        }

        return validatedData
    }

    /**
     * Validates a fulfillment option during checkout
     */
    async validateOption(
        data: Record<string, unknown>
    ): Promise<boolean> {
        // All options are valid for Makesend if they have the required structure
        const optionId = data.id as string
        if (!optionId) {
            return false
        }

        const validOptions = ["makesend-standard", "makesend-chill", "makesend-frozen"]
        return validOptions.includes(optionId)
    }

    /**
     * Returns whether this provider can calculate shipping prices
     */
    async canCalculate(
        data: CreateShippingOptionDTO
    ): Promise<boolean> {
        // Makesend supports price calculation via /order/calculateFee
        return true
    }

    /**
     * Calculates the shipping price using Makesend API
     * Note: Makesend returns prices in Satang (1 Baht = 100 Satang)
     */
    async calculatePrice(
        optionData: CalculateShippingOptionPriceDTO["optionData"],
        data: CalculateShippingOptionPriceDTO["data"],
        context: CalculateShippingOptionPriceDTO["context"]
    ): Promise<CalculatedShippingOptionPrice> {
        try {
            const temperature = (optionData.temperature as number) ?? Temperature.CHILL

            // Extract origin location from context.from_location
            const fromLocation = context.from_location
            const fromAddress = fromLocation?.address

            // Extract destination from context.shipping_address
            const shippingAddress = context.shipping_address

            // Get origin location - try postal code first, then province code
            let originProvinceID = 1
            let originDistrictID = 1
            const originPostalCode = fromAddress?.postal_code
            if (originPostalCode) {
                const originLocation = getLocationFromPostalCode(originPostalCode)
                if (originLocation.provinceId) {
                    originProvinceID = originLocation.provinceId
                    originDistrictID = originLocation.districtId || originLocation.provinceId
                }
            }
            if (originProvinceID === 1) {
                // Fallback to province code
                originProvinceID = getProvinceId(fromAddress?.city as string) ||
                    getProvinceId(fromAddress?.province as string) || 1
                originDistrictID = (data?.originDistrictID as number) || originProvinceID
            }

            // Get destination location - try postal code first, then province code
            let destinationProvinceID = 1
            let destinationDistrictID = 1
            const destPostalCode = shippingAddress?.postal_code
            if (destPostalCode) {
                const destLocation = getLocationFromPostalCode(destPostalCode)
                if (destLocation.provinceId) {
                    destinationProvinceID = destLocation.provinceId
                    destinationDistrictID = destLocation.districtId || destLocation.provinceId
                }
            }
            if (destinationProvinceID === 1) {
                // Fallback to province code
                destinationProvinceID = getProvinceId(shippingAddress?.city) ||
                    getProvinceId(shippingAddress?.province) || 1
                destinationDistrictID = (data?.destinationDistrictID as number) || destinationProvinceID
            }

            const request: CalculateFeeRequest = {
                originProvinceID,
                originDistrictID,
                destinationProvinceID,
                destinationDistrictID,
                cod: (data?.cod as number) || 0,
                temp: temperature,
                parcelSize: (data?.parcelSize as number) || ParcelSize.S80,
                parcelType: (data?.parcelType as string) || ParcelType.OTHER,
            }

            const response = await this.client_.calculateFee(request)

            // Validate response
            if (!response || typeof response.totalFee !== 'number') {
                this.logger_.error(`[Makesend] Invalid calculateFee response: ${JSON.stringify(response)}`)
                throw new Error("Invalid response from Makesend calculateFee API")
            }

            // Return total fee - divide by 100 to convert from Satang to Baht
            // Medusa expects prices in the store's currency unit (e.g., Baht)
            return {
                calculated_amount: response.totalFee / 100,
                is_calculated_price_tax_inclusive: false,
            }
        } catch (error) {
            this.logger_.error("Failed to calculate Makesend shipping price", error)

            if (error instanceof MakesendApiError) {
                throw new Error(`Makesend API error: ${error.message}`)
            }

            throw error
        }
    }

    /**
     * Creates a fulfillment in Makesend
     * Called when an order is marked for fulfillment
     * Uses workflow pattern for proper stock location access
     */
    async createFulfillment(
        data: Record<string, unknown>,
        items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
        order: Partial<FulfillmentOrderDTO> | undefined,
        fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items" | "location">>
    ): Promise<CreateFulfillmentResult> {
        try {
            this.logger_.info(`[Makesend] Creating fulfillment for data ${JSON.stringify(data)}`)
            const shippingAddress = order?.shipping_address
            const locationId = fulfillment.location_id as string

            if (!locationId) {
                throw new MedusaError(
                    MedusaError.Types.INVALID_DATA,
                    "Missing location_id for fulfillment"
                )
            }

            if (!shippingAddress) {
                throw new MedusaError(
                    MedusaError.Types.INVALID_DATA,
                    "Missing shipping address for fulfillment"
                )
            }

            // Run the shipment creation workflow
            const { result, errors } = await createMakesendShipmentWorkflow().run({
                input: {
                    apiKey: this.options_.apiKey,
                    baseUrl: this.options_.baseUrl,
                    locationId,
                    fulfillmentId: fulfillment.id as string,
                    deliveryAddress: {
                        first_name: shippingAddress.first_name as string,
                        last_name: shippingAddress.last_name as string,
                        company: shippingAddress.company as string,
                        address_1: shippingAddress.address_1 as string,
                        address_2: shippingAddress.address_2 as string,
                        city: shippingAddress.city as string,
                        province: shippingAddress.province as string,
                        postal_code: shippingAddress.postal_code as string,
                        phone: shippingAddress.phone as string,
                        country_code: shippingAddress.country_code as string,
                    },
                    temperature: data?.temperature as number,
                    parcelSize: data?.parcelSize as number,
                    parcelType: data?.parcelType as string,
                    note: data?.note as string,
                },
            })

            if (errors && errors.length > 0) {
                this.logger_.error(`[Makesend] Workflow errors: ${JSON.stringify(errors)}`)
                throw new MedusaError(
                    MedusaError.Types.UNEXPECTED_STATE,
                    `Failed to create Makesend shipment: ${errors[0]?.error?.message || 'Unknown error'}`
                )
            }

            this.logger_.info(`[Makesend] Fulfillment created: ${result.trackingId}`)

            return {
                data: {
                    id: result.orderId,
                    trackingNumber: result.trackingId,
                    aliasId: result.aliasId,
                    deliveryFee: result.deliveryFee,
                },
                labels: [
                    {
                        tracking_number: result.trackingId,
                        tracking_url: `https://app.makesend.asia/tracking?t=${result.trackingId}`,
                        label_url: `https://app.makesend.asia/waybill/${result.trackingId}`,
                    },
                ],
            }
        } catch (error: any) {
            this.logger_.error(`[Makesend] Failed to create fulfillment: ${error.message}`)

            if (error instanceof MedusaError) {
                throw error
            }

            if (error instanceof MakesendApiError) {
                throw new MedusaError(
                    MedusaError.Types.UNEXPECTED_STATE,
                    `Makesend API error: ${error.message}`
                )
            }

            throw new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                `Failed to create Makesend fulfillment: ${error.message}`
            )
        }
    }

    /**
     * Cancels a fulfillment in Makesend
     * If no tracking ID exists (Makesend order was never created), returns success
     */
    async cancelFulfillment(
        fulfillment: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        try {
            const fulfillmentData = fulfillment as unknown as MakesendFulfillmentData

            this.logger_.info(`[Makesend] Fulfillment data: ${JSON.stringify(fulfillmentData)}`)

            // If no tracking ID, no Makesend order was created - nothing to cancel
            if (!fulfillmentData?.trackingNumber) {
                this.logger_.info("[Makesend] No tracking ID found - no Makesend order to cancel")
                return { cancelled: true, noMakesendOrder: true }
            }

            const response = await this.client_.cancelShipment({
                trackingID: [fulfillmentData.trackingNumber],
            })

            const trackingId = fulfillmentData.trackingNumber

            if (response.data.cancelSuccess.includes(trackingId)) {
                return { cancelled: true, trackingID: trackingId }
            }

            if (response.data.alreadyCancel.includes(trackingId)) {
                return { cancelled: true, alreadyCancelled: true, trackingID: trackingId }
            }

            if (response.data.overCencelTimeLimit.includes(trackingId)) {
                throw new Error(`Cannot cancel shipment ${trackingId}: past cancellation time limit`)
            }

            if (response.data.invalidTrackingID.includes(trackingId)) {
                throw new Error(`Invalid tracking ID: ${trackingId}`)
            }

            return { cancelled: false, trackingID: trackingId }
        } catch (error) {
            this.logger_.error("Failed to cancel Makesend fulfillment", error)

            if (error instanceof MakesendApiError) {
                throw new Error(`Makesend API error: ${error.message}`)
            }

            throw error
        }
    }

    /**
     * Returns fulfillment documents (tracking info)
     */
    async getFulfillmentDocuments(
        data: Record<string, unknown>
    ): Promise<never[]> {
        // Makesend doesn't provide downloadable labels via API
        // Return empty array for now
        return []
    }

    /**
     * Creates a return fulfillment
     * Makesend handles returns through their own system
     */
    async createReturnFulfillment(
        fulfillment: Record<string, unknown>
    ): Promise<CreateFulfillmentResult> {
        // Returns are handled by Makesend's RETURNING/RETURNED status
        // Customer can request return through Makesend's system
        return {
            data: {},
            labels: [],
        }
    }

    /**
     * Track a shipment using Makesend API
     * Utility method for external use
     */
    async trackShipment(trackingId: string) {
        try {
            return await this.client_.trackShipment({ trackingID: trackingId })
        } catch (error) {
            this.logger_.error(`Failed to track shipment ${trackingId}`, error)
            throw error
        }
    }


    /**
     * Get delivery date (next business day)
     */
    private getDeliveryDate(): string {
        const now = new Date()
        const currentHour = now.getHours()
        let targetDate = new Date(now)

        // If after 10 AM (>= 10), move to next day
        // Otherwise use today
        if (currentHour >= 10) {
            targetDate.setDate(targetDate.getDate() + 1)
        }

        // Check if target date is Sunday (0)
        // If Sunday, move to next day (Monday)
        if (targetDate.getDay() === 0) {
            targetDate.setDate(targetDate.getDate() + 1)
        }

        return targetDate.toISOString().split("T")[0] // YYYY-MM-DD format
    }
}

export default MakesendFulfillmentProviderService
