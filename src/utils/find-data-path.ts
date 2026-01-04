/**
 * Utility to find data files in the plugin
 * Works in both development and published contexts
 */

import { existsSync } from "fs"
import { join, dirname } from "path"

/**
 * Find a data file from multiple possible locations
 * Returns the first path that exists, or null if none found
 */
export function findDataPath(filename: string): string | null {
    // Try to resolve from package root
    let packageRoot: string
    try {
        const packageJsonPath = require.resolve("medusa-plugin-makesend/package.json")
        packageRoot = dirname(packageJsonPath)
    } catch {
        // If package resolution fails, use relative path from this file
        packageRoot = join(__dirname, "../../../..")
    }

    const possiblePaths = [
        // Published package: data folder at package root
        join(packageRoot, "data", filename),
        // From .medusa/server build output
        join(packageRoot, "..", "data", filename),
        // Development mode from src
        join(__dirname, "../../data", filename),
        // Direct from current working directory
        join(process.cwd(), "node_modules/medusa-plugin-makesend/data", filename),
    ]

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            return path
        }
    }

    console.error(`[Makesend] Data file ${filename} not found in paths:`, possiblePaths)
    return null
}
