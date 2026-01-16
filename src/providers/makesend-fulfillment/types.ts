/**
 * Makesend API TypeScript Types and Enums
 * Based on Makesend API Documentation
 */

// ============================================
// ENUMS - Reference Tables
// ============================================

/**
 * Parcel Size IDs
 * @see https://docs.makesend.asia - Parcel Size Table
 */
export enum ParcelSize {
    ENV = 1,      // Envelop
    POLYM = 2,    // Polymer Bag (M)
    POLYL = 3,    // Polymer Bag (L)
    S40 = 4,      // Mini (S40)
    S60 = 5,      // S (S60)
    S80 = 6,      // S+ (S80)
    S100 = 7,     // M (S100)
    S120 = 8,     // L (S120)
    S140 = 9,     // S140
    S160 = 10,    // XL (S160)
    S180 = 11,    // S180
    S200 = 12,    // XXL (S200)
}

/**
 * Parcel Type Categories
 */
export enum ParcelType {
    DOCUMENT = "document",
    CAKE = "cake",
    SNACK = "snack",
    FRUIT = "fruit",
    DRINK = "drink",
    CLOTHE = "clothe",
    INSTRUMENT = "instrument",
    COSMETICS = "cosmetics",
    TOY = "toy",
    BABY = "baby",
    SPORT = "sport",
    TREE = "tree",
    AUTOPART = "autopart",
    GAME = "game",
    PET = "pet",
    FURNITURE = "furniture",
    BAKERY = "bakery",
    FOOD = "food",
    ELECTRONICS = "electronics",
    ITDEVICE = "itdevice",
    FRAGILE = "fragile",
    MEDICAL = "medical",
    WINE = "wine",
    ALCOHOL = "alcohol",
    OTHER = "other",
}

/**
 * Temperature Control Options
 */
export enum Temperature {
    NORMAL = 0,
    CHILL = 1,
    FROZEN = 2,
}

/**
 * Pickup Type Options
 */
export enum PickupType {
    PICKUP_AT_SENDER = 0,
    DROP_AT_BRANCH = 1,
}

/**
 * Pickup Time Slot IDs
 */
export enum PickupTimeSlot {
    SLOT_8_10 = 1,
    SLOT_10_12 = 2,
    SLOT_12_14 = 3,
    CUTOFF_9 = 4,
    CUTOFF_11 = 5,
    CUTOFF_13 = 6,
    CUTOFF_10 = 7,
    CUTOFF_12 = 8,
    CUTOFF_14 = 9,
}

/**
 * Shipment Status Codes
 */
export enum ShipmentStatusCode {
    PENDING = "PENDING",
    SHIPPED = "SHIPPED",
    ARRIVED_HUB = "ARRIVED_HUB",
    SORTED = "SORTED",
    NOT_FOUND = "NOT_FOUND",
    ROTATING = "ROTATING",
    DELIVERING = "DELIVERING",
    DELIVERED = "DELIVERED",
    DELIVERING_DELAY = "DELIVERING_DELAY",
    DELIVERED_DELAY = "DELIVERED_DELAY",
    DELIVERY_FAILED = "DELIVERY_FAILED",
    DELIVERING_RE = "DELIVERING_RE",
    DELIVERED_RE = "DELIVERED_RE",
    RETURNED = "RETURNED",
    RETURNING = "RETURNING",
    CANCELED = "CANCELED",
}

/**
 * Shipment Status IDs
 */
export enum ShipmentStatusId {
    PENDING = 100,
    SHIPPED = 200,
    ARRIVED_HUB = 201,
    SORTED = 202,
    NOT_FOUND = 203,
    ROTATING = 204,
    DELIVERING = 300,
    DELIVERED = 301,
    DELIVERING_DELAY = 302,
    DELIVERED_DELAY = 303,
    DELIVERY_FAILED = 304,
    DELIVERING_RE = 305,
    DELIVERED_RE = 306,
    RETURNED = 400,
    RETURNING = 401,
    CANCELED = 999,
}

/**
 * Bank Codes for COD
 */
export enum BankCode {
    PROMPTPAY = "pp",
    BBL = "bbl",
    KTB = "ktb",
    BAY = "bay",
    KBANK = "kbank",
    SCB = "scb",
    TTB = "ttb",
    UOB = "uob",
    GSB = "gsb",
    CITI = "citi",
    KKP = "kkp",
    CIMB = "cimb",
    TISCO = "tisco",
    BAAC = "baac",
    GHB = "ghb",
    ISBT = "isbt",
    ICBC = "icbc",
    LHFG = "lhfg",
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Shipment object for order creation
 */
export interface CreateOrderShipment {
    parcelSize: ParcelSize | number
    parcelType: ParcelType | string
    receiverName: string
    receiverPhone: string
    dropAddress: string
    dropProvince: number
    dropDistrict: number
    dropSubDistrict?: number
    dropPostcode: string
    cod: number
    temp: Temperature | number
    note: string
    codAccountBank?: BankCode | string
    codAccountNumber?: string
    codAccountName?: string
    aliasID: string
}

/**
 * Create Order Request
 */
export interface CreateOrderRequest {
    deliveryDate: string // YYYY-MM-DD
    senderName: string // Full name of sender
    senderPhone: string // Phone number of sender
    pickupAddress: string // Full address of pickup
    pickupProvince: number // Province ID of pickup
    pickupDistrict: number // District ID of pickup
    pickupSubDistrict?: number // Subdistrict ID of pickup
    pickupPostcode: string // Postcode of pickup
    pickupType: PickupType | number // Pickup type
    branch: number // Branch ID of branch/service point, 0 is pickup at sender
    pickupTime: PickupTimeSlot | number // Pickup time slot
    promocode?: string // Promotion code
    promocodeAbortOnInvalid?: boolean // Abort on invalid promotion code
    shipment: CreateOrderShipment[]
}

/**
 * Tracking Request
 */
export interface TrackingRequest {
    trackingID: string
}

/**
 * Calculate Fee Request
 */
export interface CalculateFeeRequest {
    originProvinceID: number
    originDistrictID: number
    originSubDistrictID?: number
    destinationProvinceID: number
    destinationDistrictID: number
    destinationSubDistrictID?: number
    cod: number // In Satang
    temp: Temperature | number
    parcelSize: ParcelSize | number
    parcelType?: ParcelType | string
}

/**
 * Cancel Shipment Request
 */
export interface CancelShipmentRequest {
    trackingID: string[]
}

/**
 * Promotion Code Check Request
 */
export interface PromotionCheckRequest {
    shipment: Array<{
        destinationProvinceID: number
        cod: number
        temp: boolean
        parcelSize: number
    }>
    originProvinceID: number
    code: string
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Base API Response
 */
export interface MakesendApiResponse {
    resCode: number
    message: string
}

/**
 * Shipment response from order creation
 */
export interface CreateOrderShipmentResponse {
    trackingID: string
    receiverName: string
    receiverPhone: string
    aliasID: string
    deliveryFee: number // In Satang
}

/**
 * Create Order Response
 */
export interface CreateOrderResponse extends MakesendApiResponse {
    orderID: string
    pickupFee: number // In Satang
    totalPrice: number // In Satang
    shipment: CreateOrderShipmentResponse[]
}

/**
 * Tracking Step
 */
export interface TrackingStep {
    datetime: string
    status: string
    description: string
}

/**
 * Tracking Response
 */
export interface TrackingResponse extends MakesendApiResponse {
    trackingID: string
    receiverName: string
    receiverPhone: string
    address: string
    pickupProvince: string
    pickupDistrict: string
    dropProvince: string
    dropDistrict: string
    pickupProvinceID: number
    dropProvinceID: number
    step: TrackingStep[]
}

/**
 * Calculate Fee Response
 */
export interface CalculateFeeResponse extends MakesendApiResponse {
    deliveryFee: number // In Satang
    codFee: number // In Satang
    tempFee: number // In Satang
    defaultPickupFee: number // In Satang
    minimumParcelForPickupFree: number
    totalFee: number // In Satang
}

/**
 * Cancel Shipment Response
 */
export interface CancelShipmentResponse {
    data: {
        invalidTrackingID: string[]
        overCencelTimeLimit: string[]
        cancelSuccess: string[]
        alreadyCancel: string[]
    }
    status: number
    message: string
}

/**
 * Promotion Check Response
 */
export interface PromotionCheckResponse extends MakesendApiResponse {
    discountAmount: number // In Satang
}

// ============================================
// WEBHOOK PAYLOAD TYPES
// ============================================

/**
 * Status Update Webhook Payload
 */
export interface StatusUpdateWebhookPayload {
    trackingID: string
    aliasID: string
    statusID: ShipmentStatusId | number
    statusCode: ShipmentStatusCode | string
    statusName: string
    datetime: string
}

/**
 * Parcel Size Update Webhook Payload
 */
export interface ParcelSizeUpdateWebhookPayload {
    trackingID: string
    aliasID: string
    sizeID: ParcelSize | number
    sizeCode: string
    sizeName: string
    extraFee: number // In Satang
    datetime: string
}

// ============================================
// PLUGIN OPTIONS
// ============================================

/**
 * Makesend Provider Options
 */
export interface MakesendProviderOptions {
    /**
     * Makesend API Key (ms-key header)
     */
    apiKey: string

    /**
     * Base URL for Makesend API
     * @default "https://apis.makesend.asia/oapi/api"
     */
    baseUrl?: string

    /**
     * Base URL for Makesend tracking URLs
     * @default "https://app.makesend.asia"
     */
    trackingBaseUrl?: string

    /**
     * Base URL for Makesend label URLs
     * @default "https://app.makesend.asia"
     */
    labelBaseUrl?: string

    /**
     * Enable debug logging
     * @default false
     */
    debug?: boolean
}

/**
 * Default sender/pickup address configuration
 */
export interface DefaultPickupAddress {
    senderName: string
    senderPhone: string
    pickupAddress: string
    pickupProvince: number
    pickupDistrict: number
    pickupSubDistrict?: number
    pickupPostcode: string
    pickupType: PickupType
    branch?: number
    pickupTime: PickupTimeSlot
}

// ============================================
// FULFILLMENT DATA TYPES
// ============================================

/**
 * Data stored with Medusa fulfillment for tracking
 */
export interface MakesendFulfillmentData {
    orderID: string
    trackingNumber: string
    aliasID: string
    deliveryFee: number
    status?: ShipmentStatusCode
    lastUpdated?: string
}

/**
 * Fulfillment option data
 */
export interface MakesendFulfillmentOption {
    id: string
    name: string
    temperature: Temperature
    parcelSizes: ParcelSize[]
}
