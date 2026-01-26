/**
 * Makesend Fulfillment Provider Loader
 * Sets up webhooks on module initialization
 */

import { LoaderOptions } from "@medusajs/framework/types"
import { MakesendClient } from "./client"
import { MakesendProviderOptions } from "./types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Loader function to set up Makesend webhooks
 */
export default async function loader({
    container,
    options,
}: LoaderOptions): Promise<void> {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    try {
        // Cast options to MakesendProviderOptions
        const makesendOptions = options as unknown as MakesendProviderOptions

        if (!makesendOptions || !makesendOptions.apiKey) {
            logger.info("[Makesend] No API key configured. Skipping webhook setup.")
            return
        }

        // Create Makesend client
        const client = new MakesendClient(makesendOptions)

        // Setup webhook URLs if provided
        if (makesendOptions.statusWebhookUrl) {
            const statusResult = await client.setupStatusWebhook(makesendOptions.statusWebhookUrl)
            logger.info(`[Makesend] Status webhook setup result: ${statusResult.message}`)
        } else {
            logger.info("[Makesend] No status webhook URL provided. Skipping status webhook setup.")
        }

        if (makesendOptions.parcelSizeWebhookUrl) {
            const parcelResult = await client.setupParcelSizeWebhook(makesendOptions.parcelSizeWebhookUrl)
            logger.info(`[Makesend] Parcel size webhook setup result: ${parcelResult.message}`)
        } else {
            logger.info("[Makesend] No parcel size webhook URL provided. Skipping parcel size webhook setup.")
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error(`[Makesend] Failed to set up webhooks: ${errorMessage}`)
        // Don't throw error to prevent module loading failure
        // Webhooks can be set up manually if needed
    }
}
