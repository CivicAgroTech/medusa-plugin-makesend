/**
 * Makesend Settings Module
 * Module for managing Makesend fulfillment configuration
 */

import MakesendModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MAKESEND_MODULE = "makesend"

export default Module(MAKESEND_MODULE, {
    service: MakesendModuleService,
})

export { MakesendModuleService }
