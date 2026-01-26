/**
 * Makesend Fulfillment Provider Module Export
 */

import MakesendFulfillmentProviderService from "./service"
import loader from "./loader"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

export default ModuleProvider(Modules.FULFILLMENT, {
    services: [MakesendFulfillmentProviderService],
    loaders: [loader],
})
