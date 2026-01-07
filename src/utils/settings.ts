/**
 * Utility to load Makesend settings
 * Provides helper functions for accessing plugin configuration
 */

import { MedusaContainer } from "@medusajs/framework/types"
import { ParcelSize } from "../providers/makesend/types"
import MakesendSettingsModuleService from "../modules/makesend-settings/service"
import { MAKESEND_SETTINGS_MODULE } from "../modules/makesend-settings"

interface MakesendSettings {
    originProvinceId: number | null
    originDistrictId: number | null
    originProvinceName?: string
    originDistrictName?: string
    senderName?: string
    senderPhone?: string
    pickupAddress?: string
    pickupPostcode?: string
    timeCutoff?: string
    supportedParcelSizes?: string[]
    createdAt?: Date
    updatedAt?: Date
}

// Map parcel size codes to ParcelSize enum values
const PARCEL_SIZE_CODE_MAP: Record<string, ParcelSize> = {
    "s40": ParcelSize.S40,
    "s60": ParcelSize.S60,
    "s80": ParcelSize.S80,
    "s100": ParcelSize.S100,
    "s120": ParcelSize.S120,
    "s140": ParcelSize.S140,
    "s160": ParcelSize.S160,
    "s180": ParcelSize.S180,
    "s200": ParcelSize.S200,
    "env": ParcelSize.ENV,
    "polym": ParcelSize.POLYM,
    "polyl": ParcelSize.POLYL,
}

/**
 * Load settings from database
 * Returns null if no settings exist
 */
export async function loadSettings(container: MedusaContainer): Promise<MakesendSettings | null> {
    try {
        const settingsModuleService: MakesendSettingsModuleService =
            container.resolve(MAKESEND_SETTINGS_MODULE)

        const settings = await settingsModuleService.getSettings()

        if (!settings) {
            return null
        }

        // Parse supportedParcelSizes from JSON if it's a string
        let supportedParcelSizes: string[] = []
        if (settings.supportedParcelSizes) {
            if (typeof settings.supportedParcelSizes === 'string') {
                try {
                    supportedParcelSizes = JSON.parse(settings.supportedParcelSizes)
                } catch {
                    supportedParcelSizes = []
                }
            } else if (Array.isArray(settings.supportedParcelSizes)) {
                supportedParcelSizes = settings.supportedParcelSizes
            }
        }

        return {
            originProvinceId: settings.originProvinceId,
            originDistrictId: settings.originDistrictId,
            originProvinceName: settings.originProvinceName || undefined,
            originDistrictName: settings.originDistrictName || undefined,
            senderName: settings.senderName || undefined,
            senderPhone: settings.senderPhone || undefined,
            pickupAddress: settings.pickupAddress || undefined,
            pickupPostcode: settings.pickupPostcode || undefined,
            timeCutoff: settings.timeCutoff || undefined,
            supportedParcelSizes,
            createdAt: settings.created_at,
            updatedAt: settings.updated_at,
        }
    } catch (error) {
        console.error("[Makesend] Failed to load settings:", error)
        return null
    }
}

/**
 * Get supported parcel sizes from settings
 * Returns array of ParcelSize enum values
 * If no settings found or empty, returns default sizes [S80, S100]
 */
export async function getSupportedParcelSizes(container: MedusaContainer): Promise<ParcelSize[]> {
    const settings = await loadSettings(container)

    // Default parcel sizes if no settings or empty
    if (!settings || !settings.supportedParcelSizes || settings.supportedParcelSizes.length === 0) {
        return [ParcelSize.S80, ParcelSize.S100]
    }

    // Convert codes to ParcelSize enum values
    const parcelSizes: ParcelSize[] = []
    for (const code of settings.supportedParcelSizes) {
        const size = PARCEL_SIZE_CODE_MAP[code]
        if (size !== undefined) {
            parcelSizes.push(size)
        }
    }

    // Return default if no valid codes found
    return parcelSizes.length > 0 ? parcelSizes : [ParcelSize.S80, ParcelSize.S100]
}

/**
 * Check if a parcel size is supported
 */
export async function isParcelSizeSupported(container: MedusaContainer, parcelSize: ParcelSize): Promise<boolean> {
    const supportedSizes = await getSupportedParcelSizes(container)
    return supportedSizes.includes(parcelSize)
}

/**
 * Get the first supported parcel size (default)
 */
export async function getDefaultParcelSize(container: MedusaContainer): Promise<ParcelSize> {
    const sizes = await getSupportedParcelSizes(container)
    return sizes[0]
}

/**
 * Get pickup time slot based on cutoff time configuration
 * 
 * Logic:
 * - Orders placed before cutoff time → Cycle 1 (PickupTimeSlot.SLOT_8_10)
 * - Orders placed after cutoff time → Cycle 2 (PickupTimeSlot.SLOT_10_12)
 * 
 * If no cutoff time is configured, defaults to SLOT_10_12
 * 
 * @param container - The Medusa container
 * @param orderTime - The time when the order was placed (Date object or undefined for current time)
 * @returns PickupTimeSlot enum value (1 or 2)
 */
export async function getPickupTimeSlot(container: MedusaContainer, orderTime?: Date): Promise<number> {
    const settings = await loadSettings(container)

    // Default to SLOT_10_12 if no cutoff configured
    if (!settings || !settings.timeCutoff) {
        return 2 // PickupTimeSlot.SLOT_10_12
    }

    // Parse cutoff time (format: "HH:MM")
    const [cutoffHour, cutoffMinute] = settings.timeCutoff.split(":").map(Number)
    if (isNaN(cutoffHour) || isNaN(cutoffMinute)) {
        return 2 // Default if invalid format
    }

    // Get order time (or current time if not provided)
    const now = orderTime || new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const cutoffTimeInMinutes = cutoffHour * 60 + cutoffMinute

    // If order time is before cutoff → Cycle 1 (SLOT_8_10)
    // If order time is after cutoff → Cycle 2 (SLOT_10_12)
    if (currentTimeInMinutes < cutoffTimeInMinutes) {
        return 1 // PickupTimeSlot.SLOT_8_10
    } else {
        return 2 // PickupTimeSlot.SLOT_10_12
    }
}
