/**
 * Makesend Settings Data Model
 * Stores configuration for the Makesend fulfillment integration
 */

import { model } from "@medusajs/framework/utils"

const MakesendSetting = model.define("makesend_setting", {
    id: model.id().primaryKey(),
    originProvinceId: model.number().nullable(),
    originDistrictId: model.number().nullable(),
    originProvinceName: model.text().nullable(),
    originDistrictName: model.text().nullable(),
    senderName: model.text().nullable(),
    senderPhone: model.text().nullable(),
    pickupAddress: model.text().nullable(),
    pickupPostcode: model.text().nullable(),
    timeCutoff: model.text().nullable(), // HH:MM format (e.g., "17:00")
    supportedParcelSizes: model.json().nullable(), // Array of parcel size codes
})

export default MakesendSetting
