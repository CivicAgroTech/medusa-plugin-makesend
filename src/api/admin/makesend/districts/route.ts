/**
 * Makesend Districts API Route
 * Returns list of Thai districts, optionally filtered by province
 * 
 * @see GET /admin/makesend/districts?provinceId=1
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readFileSync } from "fs"
import { findDataPath } from "../../../../utils/find-data-path"

interface DistrictData {
    header: string[]
    body: [number, string, number][] // [ID, District Name, Province ID]
    resCode: number
    message: string
}

/**
 * GET /admin/makesend/districts
 * Query params:
 * - provinceId: Filter districts by province ID
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const provinceId = req.query.provinceId
            ? parseInt(req.query.provinceId as string, 10)
            : null

        const dataPath = findDataPath("district.json")
        if (!dataPath) {
            res.status(500).json({ error: "District data file not found" })
            return
        }

        const rawData = readFileSync(dataPath, "utf-8")
        const data: DistrictData = JSON.parse(rawData)

        // Transform and optionally filter by province
        let districts = data.body.map(([id, name, province]) => ({
            id,
            name,
            provinceId: province,
        }))

        if (provinceId) {
            districts = districts.filter(d => d.provinceId === provinceId)
        }

        res.status(200).json({
            districts,
            count: districts.length,
            provinceId: provinceId || "all",
        })
    } catch (error) {
        console.error("[Makesend] Failed to load districts:", error)

        res.status(500).json({
            error: "Failed to load district data",
        })
    }
}
