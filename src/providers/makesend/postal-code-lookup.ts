/**
 * Postal Code (Zipcode) Lookup Utility
 * Maps Thai postal codes to Province and District IDs
 * 
 * Data source: earthchie/jquery.Thailand.js
 */

import { readFileSync } from "fs"
import { findDataPath } from "../../utils/find-data-path"

/**
 * Thailand address entry from raw database
 */
interface ThailandAddressEntry {
    district: string       // Tambon (sub-district)
    amphoe: string         // Amphoe (district)
    province: string       // Province
    zipcode: number        // Postal code
    district_code: number  // Sub-district code (6 digits)
    amphoe_code: number    // Amphoe/District code (4 digits)
    province_code: number  // Province code (ISO style, 2 digits)
}

/**
 * Lookup result for postal code
 */
export interface PostalCodeLookupResult {
    postalCode: string
    province: string
    provinceCode: number
    amphoe: string
    amphoeCode: number
    district: string
    districtCode: number
    makesendProvinceId: number | null
    makesendDistrictId: number | null
}

// Lazy-loaded database
let addressDatabase: ThailandAddressEntry[] | null = null

/**
 * Load the Thailand address database
 */
function loadDatabase(): ThailandAddressEntry[] {
    if (addressDatabase) {
        return addressDatabase
    }

    try {
        const dataPath = findDataPath("thailand_addresses.json")
        if (!dataPath) {
            console.error("[Makesend] Thailand address database not found")
            return []
        }

        const rawData = readFileSync(dataPath, "utf-8")
        addressDatabase = JSON.parse(rawData)
        console.log(`[Makesend] Loaded Thailand address database from ${dataPath}`)
        return addressDatabase!
    } catch (error) {
        console.error("[Makesend] Failed to load Thailand address database:", error)
        return []
    }
}

/**
 * Import province mapping for conversion
 */
import { ISO_TO_MAKESEND_PROVINCE } from "./province-mapping"

/**
 * Get Makesend Province ID from ISO province code
 */
function getMakesendProvinceId(isoCode: number): number | null {
    const codeStr = String(isoCode)
    return ISO_TO_MAKESEND_PROVINCE[codeStr] ?? null
}

/**
 * Get Makesend District ID from amphoe name and province
 * Uses the Makesend district.json for ID lookup
 */
let districtDatabase: [number, string, number][] | null = null

function loadDistrictDatabase(): [number, string, number][] {
    if (districtDatabase) {
        return districtDatabase
    }

    try {
        const dataPath = findDataPath("district.json")
        if (!dataPath) {
            console.error("[Makesend] District database not found")
            return []
        }

        const rawData = readFileSync(dataPath, "utf-8")
        const data = JSON.parse(rawData)
        districtDatabase = data.body
        return districtDatabase!
    } catch (error) {
        console.error("[Makesend] Failed to load district database:", error)
        return []
    }
}

/**
 * Find Makesend District ID by amphoe (district) name and province ID
 */
function getMakesendDistrictId(amphoeName: string, makesendProvinceId: number | null): number | null {
    if (!makesendProvinceId) return null

    const districts = loadDistrictDatabase()

    // Find district matching the name and province
    const match = districts.find(([id, name, provinceId]) =>
        provinceId === makesendProvinceId && name === amphoeName
    )

    return match ? match[0] : null
}

/**
 * Lookup address information by postal code
 * Returns all matching entries (a postal code can cover multiple sub-districts)
 */
export function lookupByPostalCode(postalCode: string | number): PostalCodeLookupResult[] {
    const db = loadDatabase()
    const code = typeof postalCode === "string" ? parseInt(postalCode, 10) : postalCode

    if (isNaN(code)) {
        return []
    }

    const matches = db.filter(entry => entry.zipcode === code)

    if (matches.length === 0) {
        return []
    }

    return matches.map(entry => {
        const makesendProvinceId = getMakesendProvinceId(entry.province_code)
        const makesendDistrictId = getMakesendDistrictId(entry.amphoe, makesendProvinceId)

        return {
            postalCode: String(code),
            province: entry.province,
            provinceCode: entry.province_code,
            amphoe: entry.amphoe,
            amphoeCode: entry.amphoe_code,
            district: entry.district,
            districtCode: entry.district_code,
            makesendProvinceId,
            makesendDistrictId,
        }
    })
}

/**
 * Get province and district IDs from postal code
 * Returns the first match (most postal codes map to one amphoe)
 */
export function getLocationFromPostalCode(postalCode: string | number): {
    provinceId: number | null
    districtId: number | null
    provinceName: string | null
    districtName: string | null
} {
    const results = lookupByPostalCode(postalCode)

    if (results.length === 0) {
        return {
            provinceId: null,
            districtId: null,
            provinceName: null,
            districtName: null,
        }
    }

    // Use the first result (most postal codes have consistent amphoe)
    const first = results[0]

    return {
        provinceId: first.makesendProvinceId,
        districtId: first.makesendDistrictId,
        provinceName: first.province,
        districtName: first.amphoe,
    }
}

/**
 * Get unique amphoe (district) list for a postal code
 */
export function getAmphoeFromPostalCode(postalCode: string | number): {
    amphoe: string
    amphoeCode: number
    makesendDistrictId: number | null
}[] {
    const results = lookupByPostalCode(postalCode)

    // Deduplicate by amphoe name
    const seen = new Set<string>()
    return results.filter(r => {
        if (seen.has(r.amphoe)) return false
        seen.add(r.amphoe)
        return true
    }).map(r => ({
        amphoe: r.amphoe,
        amphoeCode: r.amphoeCode,
        makesendDistrictId: r.makesendDistrictId,
    }))
}

/**
 * Get Makesend District ID by district name
 * Searches through all districts
 */
export function getDistrictIdByName(districtName: string): number | null {
    const districts = loadDistrictDatabase()

    const match = districts.find(([id, name, provinceId]) => name === districtName)

    return match ? match[0] : null
}

/**
 * Get Makesend District ID by district name and province ID
 */
export function getDistrictId(districtName: string, provinceId: number): number | null {
    return getMakesendDistrictId(districtName, provinceId)
}
