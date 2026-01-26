/**
 * Makesend API Client
 * HTTP client wrapper for Makesend logistics API
 */

import {
    CreateOrderRequest,
    CreateOrderResponse,
    TrackingRequest,
    TrackingResponse,
    CalculateFeeRequest,
    CalculateFeeResponse,
    CancelShipmentRequest,
    CancelShipmentResponse,
    PromotionCheckRequest,
    PromotionCheckResponse,
    MakesendProviderOptions,
} from "./types"

const DEFAULT_BASE_URL = "https://apis.makesend.asia/oapi/api"

/**
 * Makesend API Error
 */
export class MakesendApiError extends Error {
    public readonly statusCode: number
    public readonly response: unknown

    constructor(message: string, statusCode: number, response?: unknown) {
        super(message)
        this.name = "MakesendApiError"
        this.statusCode = statusCode
        this.response = response
    }
}

/**
 * Makesend API Client
 */
export class MakesendClient {
    private readonly apiKey: string
    private readonly baseUrl: string
    private readonly debug: boolean

    constructor(options: MakesendProviderOptions) {
        if (!options.apiKey) {
            throw new Error("Makesend API key is required")
        }

        this.apiKey = options.apiKey
        this.baseUrl = options.baseUrl || DEFAULT_BASE_URL
    }

    /**
     * Make HTTP request to Makesend API
     */
    private async request<T>(
        endpoint: string,
        body: unknown
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ms-key": this.apiKey,
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (this.debug) {
                console.log(`[Makesend] Response: ${endpoint}`, JSON.stringify(data, null, 2))
            }

            // Check for API-level errors
            if (data.resCode && data.resCode !== 200) {
                throw new MakesendApiError(
                    data.message || "API request failed",
                    data.resCode,
                    data
                )
            }

            // Some endpoints use 'status' instead of 'resCode'
            if (data.status && data.status !== 200) {
                throw new MakesendApiError(
                    data.message || "API request failed",
                    data.status,
                    data
                )
            }

            return data as T
        } catch (error) {
            if (error instanceof MakesendApiError) {
                throw error
            }

            // Handle network/fetch errors
            const message = error instanceof Error ? error.message : "Network request failed"
            throw new MakesendApiError(message, 500)
        }
    }

    /**
     * Create a delivery order with one or more shipments
     * @see POST /order/create
     */
    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        return this.request<CreateOrderResponse>("/order/create", request)
    }

    /**
     * Track a shipment by tracking ID or alias ID
     * @see POST /order/tracking
     */
    async trackShipment(request: TrackingRequest): Promise<TrackingResponse> {
        return this.request<TrackingResponse>("/order/tracking", request)
    }

    /**
     * Calculate delivery fee before creating an order
     * @see POST /order/calculateFee
     */
    async calculateFee(request: CalculateFeeRequest): Promise<CalculateFeeResponse> {
        return this.request<CalculateFeeResponse>("/order/calculateFee", request)
    }

    /**
     * Cancel one or more shipments
     * @see POST /shipment/cancel
     */
    async cancelShipment(request: CancelShipmentRequest): Promise<CancelShipmentResponse> {
        console.log("[Makesend] Canceling shipment", JSON.stringify(request, null, 2))
        return this.request<CancelShipmentResponse>("/shipment/cancel", request)
        // return {
        //     data: {
        //         invalidTrackingID: [],
        //         overCencelTimeLimit: [],
        //         cancelSuccess: [],
        //         alreadyCancel: [],
        //     },
        //     status: 200,
        //     message: "Shipment canceled successfully",
        // }
    }

    /**
     * Validate a promotion code and get discount amount
     * @see POST /promotion/code/check
     */
    async checkPromoCode(request: PromotionCheckRequest): Promise<PromotionCheckResponse> {
        return this.request<PromotionCheckResponse>("/promotion/code/check", request)
    }

    /**
     * Setup webhook URL for status updates
     * @see POST /webhook/setupURL/statusUpdate
     */
    async setupStatusWebhook(url: string): Promise<{ resCode: number; message: string }> {
        return this.request("/webhook/setupURL/statusUpdate", { url })
    }

    /**
     * Setup webhook URL for parcel size updates
     * @see POST /webhook/setupURL/parcelSizeUpdate
     */
    async setupParcelSizeWebhook(url: string): Promise<{ resCode: number; message: string }> {
        return this.request("/webhook/setupURL/parcelSizeUpdate", { url })
    }
}
