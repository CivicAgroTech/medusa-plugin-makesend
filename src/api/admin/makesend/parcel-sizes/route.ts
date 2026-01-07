/**
 * Makesend Parcel Sizes API Route
 * Get available parcel sizes from Makesend
 * 
 * @see GET /admin/makesend/parcel-sizes
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readFileSync } from "fs"
import { join } from "path"
import { findDataPath } from "../../../../utils/find-data-path"

interface ParcelSize {
    id: string
    code: string
    size: string
}

/**
 * GET /admin/makesend/parcel-sizes
 * Returns list of available parcel sizes
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const parcelSizeFile = findDataPath("parcelSizeList.json")

        if (!parcelSizeFile) {
            throw new Error("Parcel size data file not found")
        }

        const data = JSON.parse(readFileSync(parcelSizeFile, "utf-8"))

        // Transform the data structure to be more usable
        const parcelSizes: ParcelSize[] = data.body.map((item: string[]) => ({
            id: item[0],
            code: item[1],
            size: item[2],
        }))

        res.status(200).json({
            parcelSizes,
        })
    } catch (error) {
        console.error("[Makesend] Failed to load parcel sizes:", error)

        res.status(500).json({
            error: "Failed to load parcel sizes",
        })
    }
}
