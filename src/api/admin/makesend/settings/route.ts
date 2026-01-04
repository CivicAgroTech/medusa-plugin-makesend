/**
 * Makesend Settings API Route
 * Get and save service area settings
 * 
 * @see GET /admin/makesend/settings
 * @see POST /admin/makesend/settings
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"

interface MakesendSettings {
    originProvinceId: number | null
    originDistrictId: number | null
    originProvinceName?: string
    originDistrictName?: string
    // Sender/Pickup fields
    senderName?: string
    senderPhone?: string
    pickupAddress?: string
    pickupPostcode?: string
    updatedAt?: string
}

const SETTINGS_FILE = join(__dirname, "../../../../../.makesend-settings.json")

/**
 * Load settings from file or return defaults
 */
function loadSettings(): MakesendSettings {
    try {
        if (existsSync(SETTINGS_FILE)) {
            const data = readFileSync(SETTINGS_FILE, "utf-8")
            return JSON.parse(data)
        }
    } catch (error) {
        console.error("[Makesend] Failed to load settings:", error)
    }

    return {
        originProvinceId: null,
        originDistrictId: null,
    }
}

/**
 * Save settings to file
 */
function saveSettings(settings: MakesendSettings): void {
    try {
        const dir = dirname(SETTINGS_FILE)
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
        }
        writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    } catch (error) {
        console.error("[Makesend] Failed to save settings:", error)
        throw error
    }
}

/**
 * GET /admin/makesend/settings
 * Returns current service area settings
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const settings = loadSettings()

        res.status(200).json({
            settings,
        })
    } catch (error) {
        console.error("[Makesend] Failed to get settings:", error)

        res.status(500).json({
            error: "Failed to load settings",
        })
    }
}

/**
 * POST /admin/makesend/settings
 * Save service area settings
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const body = req.body as Partial<MakesendSettings>

        const settings: MakesendSettings = {
            originProvinceId: body.originProvinceId ?? null,
            originDistrictId: body.originDistrictId ?? null,
            originProvinceName: body.originProvinceName,
            originDistrictName: body.originDistrictName,
            senderName: body.senderName,
            senderPhone: body.senderPhone,
            pickupAddress: body.pickupAddress,
            pickupPostcode: body.pickupPostcode,
            updatedAt: new Date().toISOString(),
        }

        saveSettings(settings)

        res.status(200).json({
            settings,
            message: "Settings saved successfully",
        })
    } catch (error) {
        console.error("[Makesend] Failed to save settings:", error)

        res.status(500).json({
            error: "Failed to save settings",
        })
    }
}
