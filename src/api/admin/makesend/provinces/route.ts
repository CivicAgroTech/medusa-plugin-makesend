/**
 * Makesend Provinces API Route
 * Returns list of Thai provinces from reference data
 * 
 * @see GET /admin/makesend/provinces
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readFileSync } from "fs"
import { findDataPath } from "../../../../utils/find-data-path"

interface ProvinceData {
    header: string[]
    body: [number, string][]
    resCode: number
    message: string
}

/**
 * GET /admin/makesend/provinces
 * Returns list of provinces with ID and name
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const dataPath = findDataPath("province.json")
        if (!dataPath) {
            res.status(500).json({ error: "Province data file not found" })
            return
        }

        const rawData = readFileSync(dataPath, "utf-8")
        const data: ProvinceData = JSON.parse(rawData)

        // Transform to friendly format
        const provinces = data.body.map(([id, name]) => ({
            id,
            name,
        }))

        res.status(200).json({
            provinces,
            count: provinces.length,
        })
    } catch (error) {
        console.error("[Makesend] Failed to load provinces:", error)

        res.status(500).json({
            error: "Failed to load province data",
        })
    }
}
