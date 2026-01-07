/**
 * Makesend Settings API Route
 * Get and save service area settings
 * 
 * @see GET /admin/makesend/settings
 * @see POST /admin/makesend/settings
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import MakesendSettingsModuleService from "../../../../modules/makesend-settings/service"
import { MAKESEND_SETTINGS_MODULE } from "../../../../modules/makesend-settings"

/**
 * GET /admin/makesend/settings
 * Returns current service area settings
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const settingsModuleService: MakesendSettingsModuleService =
            req.scope.resolve(MAKESEND_SETTINGS_MODULE)

        const settings = await settingsModuleService.getSettings()

        res.status(200).json({
            settings: settings || {
                originProvinceId: null,
                originDistrictId: null,
            },
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
        const settingsModuleService: MakesendSettingsModuleService =
            req.scope.resolve(MAKESEND_SETTINGS_MODULE)

        const body = req.body as any

        const settings = await settingsModuleService.updateSettings({
            originProvinceId: body.originProvinceId ?? null,
            originDistrictId: body.originDistrictId ?? null,
            originProvinceName: body.originProvinceName,
            originDistrictName: body.originDistrictName,
            senderName: body.senderName,
            senderPhone: body.senderPhone,
            pickupAddress: body.pickupAddress,
            pickupPostcode: body.pickupPostcode,
            timeCutoff: body.timeCutoff,
            supportedParcelSizes: body.supportedParcelSizes ?? [],
        })

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
