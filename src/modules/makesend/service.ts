/**
 * Makesend Settings Module Service
 * Manages configuration for the Makesend fulfillment integration
 */

import { MedusaService } from "@medusajs/framework/utils"
import MakesendSetting from "./models/setting"

class MakesendModuleService extends MedusaService({
    MakesendSetting,
}) {
    /**
     * Get the current settings (there should only be one record)
     */
    async getSettings() {
        const [settings] = await this.listMakesendSettings({}, { take: 1 })
        return settings || null
    }

    /**
     * Update or create settings
     */
    async updateSettings(data: Partial<{
        originProvinceId: number | null
        originDistrictId: number | null
        originProvinceName: string | null
        originDistrictName: string | null
        senderName: string | null
        senderPhone: string | null
        pickupAddress: string | null
        pickupPostcode: string | null
        timeCutoff: string | null
        supportedParcelSizes: string[] | null
    }>) {
        const existing = await this.getSettings()

        // Prepare data with supportedParcelSizes as Record for database
        const dbData: any = {
            ...data,
            supportedParcelSizes: data.supportedParcelSizes || [],
        }

        if (existing) {
            // Update existing settings
            const updated = await this.updateMakesendSettings({
                id: existing.id,
                ...dbData,
            })
            return updated
        } else {
            // Create new settings
            const created = await this.createMakesendSettings(dbData)
            return created
        }
    }
}

export default MakesendModuleService
