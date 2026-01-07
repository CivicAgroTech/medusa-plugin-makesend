/**
 * Makesend Settings Module
 * Module for managing Makesend fulfillment configuration
 */

import MakesendSettingsModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MAKESEND_SETTINGS_MODULE = "makesendSettings"

export default Module(MAKESEND_SETTINGS_MODULE, {
    service: MakesendSettingsModuleService,
})
