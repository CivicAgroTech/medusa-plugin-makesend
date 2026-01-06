/**
 * Fetch Shipping Option Step
 * Retrieves shipping option to extract temperature/fulfillment option data
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Temperature } from "../../providers/makesend/types"

export type FetchShippingOptionInput = {
    shipping_option_id: string
}

export type ShippingOptionResult = {
    temperature: number
}

/**
 * Step to fetch shipping option and extract temperature
 */
export const fetchShippingOptionStep = createStep(
    "fetch-shipping-option",
    async (input: FetchShippingOptionInput, { container }) => {
        const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
            Modules.FULFILLMENT
        )

        try {
            const shippingOption = await fulfillmentModuleService.retrieveShippingOption(
                input.shipping_option_id
            )

            let temperature: number = Temperature.NORMAL

            // Try to get temperature from shipping option data
            if (shippingOption.data?.temperature !== undefined) {
                temperature = shippingOption.data.temperature as number
            } else if (shippingOption.data?.id) {
                // Map from fulfillment option ID
                const optionId = shippingOption.data.id as string
                switch (optionId) {
                    case "makesend-standard":
                        temperature = Temperature.NORMAL
                        break
                    case "makesend-chill":
                        temperature = Temperature.CHILL
                        break
                    case "makesend-frozen":
                        temperature = Temperature.FROZEN
                        break
                    default:
                        temperature = Temperature.NORMAL
                }
            }

            return new StepResponse({ temperature })
        } catch (error) {
            console.warn(`[Makesend] Failed to retrieve shipping option: ${error}`)
            // Return default temperature
            return new StepResponse({ temperature: Temperature.NORMAL })
        }
    }
)
