/**
 * ISO 3166-2:TH Province Code to Makesend Province ID Mapping
 * 
 * Supports multiple formats:
 * - ISO 3166-2:TH codes (TH-XX format)
 * - Thai province names (กรุงเทพ)
 * - English province names (Bangkok)
 * - Makesend numeric IDs (1-77)
 */

/**
 * Mapping from ISO 3166-2:TH codes to Makesend Province IDs
 * Key: ISO code number (without "TH-" prefix), Value: Makesend Province ID
 */
export const ISO_TO_MAKESEND_PROVINCE: Record<string, number> = {
    // Central Thailand (10-27)
    "10": 1,   // Bangkok (กรุงเทพ)
    "11": 2,   // Samut Prakan (สมุทรปราการ)
    "12": 4,   // Nonthaburi (นนทบุรี)
    "13": 3,   // Pathum Thani (ปทุมธานี)
    "14": 41,  // Phra Nakhon Si Ayutthaya (พระนครศรีอยุธยา)
    "15": 70,  // Ang Thong (อ่างทอง)
    "16": 54,  // Lop Buri (ลพบุรี)
    "17": 63,  // Sing Buri (สิงห์บุรี)
    "18": 26,  // Chai Nat (ชัยนาท)
    "19": 62,  // Saraburi (สระบุรี)
    "20": 7,   // Chon Buri (ชลบุรี)
    "21": 76,  // Rayong (ระยอง)
    "22": 24,  // Chanthaburi (จันทบุรี)
    "23": 30,  // Trat (ตราด)
    "24": 25,  // Chachoengsao (ฉะเชิงเทรา)
    "25": 39,  // Prachin Buri (ปราจีนบุรี)
    "26": 32,  // Nakhon Nayok (นครนายก)
    "27": 61,  // Sa Kaeo (สระแก้ว)

    // Northeastern Thailand (30-49)
    "30": 8,   // Nakhon Ratchasima (นครราชสีมา)
    "31": 38,  // Buri Ram (บุรีรัมย์)
    "32": 67,  // Surin (สุรินทร์)
    "33": 57,  // Si Sa Ket (ศรีสะเกษ)
    "34": 75,  // Ubon Ratchathani (อุบลราชธานี)
    "35": 50,  // Yasothon (ยโสธร)
    "36": 27,  // Chaiyaphum (ชัยภูมิ)
    "37": 71,  // Amnat Charoen (อำนาจเจริญ)
    "38": 37,  // Bueng Kan (บึงกาฬ)
    "39": 69,  // Nong Bua Lam Phu (หนองบัวลำภู)
    "40": 13,  // Khon Kaen (ขอนแก่น)
    "41": 72,  // Udon Thani (อุดรธานี)
    "42": 17,  // Loei (เลย)
    "43": 68,  // Nong Khai (หนองคาย)
    "44": 48,  // Maha Sarakham (มหาสารคาม)
    "45": 52,  // Roi Et (ร้อยเอ็ด)
    "46": 22,  // Kalasin (กาฬสินธุ์)
    "47": 58,  // Sakon Nakhon (สกลนคร)
    "48": 33,  // Nakhon Phanom (นครพนม)
    "49": 49,  // Mukdahan (มุกดาหาร)

    // Northern Thailand (50-58)
    "50": 15,  // Chiang Mai (เชียงใหม่)
    "51": 56,  // Lamphun (ลำพูน)
    "52": 55,  // Lampang (ลำปาง)
    "53": 73,  // Uttaradit (อุตรดิตถ์)
    "54": 18,  // Phrae (แพร่)
    "55": 36,  // Nan (น่าน)
    "56": 42,  // Phayao (พะเยา)
    "57": 77,  // Chiang Rai (เชียงราย)
    "58": 19,  // Mae Hong Son (แม่ฮ่องสอน)

    // Northern Thailand (60-67)
    "60": 34,  // Nakhon Sawan (นครสวรรค์)
    "61": 74,  // Uthai Thani (อุทัยธานี)
    "62": 23,  // Kamphaeng Phet (กำแพงเพชร)
    "63": 31,  // Tak (ตาก)
    "64": 64,  // Sukhothai (สุโขทัย)
    "65": 46,  // Phitsanulok (พิษณุโลก)
    "66": 45,  // Phichit (พิจิตร)
    "67": 16,  // Phetchabun (เพชรบูรณ์)

    // Central/Western Thailand (70-77)
    "70": 10,  // Ratchaburi (ราชบุรี)
    "71": 21,  // Kanchanaburi (กาญจนบุรี)
    "72": 65,  // Suphan Buri (สุพรรณบุรี)
    "73": 5,   // Nakhon Pathom (นครปฐม)
    "74": 6,   // Samut Sakhon (สมุทรสาคร)
    "75": 9,   // Samut Songkhram (สมุทรสงคราม)
    "76": 11,  // Phetchaburi (เพชรบุรี)
    "77": 12,  // Prachuap Khiri Khan (ประจวบคีรีขันธ์)

    // Southern Thailand (80-96)
    "80": 14,  // Nakhon Si Thammarat (นครศรีธรรมราช)
    "81": 20,  // Krabi (กระบี่)
    "82": 43,  // Phang Nga (พังงา)
    "83": 43,  // Phangnga (พังงา) - alternate spelling
    "84": 66,  // Surat Thani (สุราษฎร์ธานี)
    "85": 53,  // Ranong (ระนอง)
    "86": 28,  // Chumphon (ชุมพร)
    "90": 59,  // Songkhla (สงขลา)
    "91": 60,  // Satun (สตูล)
    "92": 29,  // Trang (ตรัง)
    "93": 44,  // Phatthalung (พัทลุง)
    "94": 40,  // Pattani (ปัตตานี)
    "95": 51,  // Yala (ยะลา)
    "96": 35,  // Narathiwat (นราธิวาส)

    // Special Administrative City
    "S": 7,    // Pattaya (พัทยา) - part of Chon Buri
}

/**
 * Mapping from Thai province names to Makesend Province IDs
 */
export const THAI_NAME_TO_MAKESEND: Record<string, number> = {
    "กรุงเทพ": 1,
    "กรุงเทพมหานคร": 1,
    "สมุทรปราการ": 2,
    "ปทุมธานี": 3,
    "นนทบุรี": 4,
    "นครปฐม": 5,
    "สมุทรสาคร": 6,
    "ชลบุรี": 7,
    "นครราชสีมา": 8,
    "สมุทรสงคราม": 9,
    "ราชบุรี": 10,
    "เพชรบุรี": 11,
    "ประจวบคีรีขันธ์": 12,
    "ขอนแก่น": 13,
    "นครศรีธรรมราช": 14,
    "เชียงใหม่": 15,
    "เพชรบูรณ์": 16,
    "เลย": 17,
    "แพร่": 18,
    "แม่ฮ่องสอน": 19,
    "กระบี่": 20,
    "กาญจนบุรี": 21,
    "กาฬสินธุ์": 22,
    "กำแพงเพชร": 23,
    "จันทบุรี": 24,
    "ฉะเชิงเทรา": 25,
    "ชัยนาท": 26,
    "ชัยภูมิ": 27,
    "ชุมพร": 28,
    "ตรัง": 29,
    "ตราด": 30,
    "ตาก": 31,
    "นครนายก": 32,
    "นครพนม": 33,
    "นครสวรรค์": 34,
    "นราธิวาส": 35,
    "น่าน": 36,
    "บึงกาฬ": 37,
    "บุรีรัมย์": 38,
    "ปราจีนบุรี": 39,
    "ปัตตานี": 40,
    "พระนครศรีอยุธยา": 41,
    "พะเยา": 42,
    "พังงา": 43,
    "พัทลุง": 44,
    "พิจิตร": 45,
    "พิษณุโลก": 46,
    "ภูเก็ต": 47,
    "มหาสารคาม": 48,
    "มุกดาหาร": 49,
    "ยโสธร": 50,
    "ยะลา": 51,
    "ร้อยเอ็ด": 52,
    "ระนอง": 53,
    "ลพบุรี": 54,
    "ลำปาง": 55,
    "ลำพูน": 56,
    "ศรีสะเกษ": 57,
    "สกลนคร": 58,
    "สงขลา": 59,
    "สตูล": 60,
    "สระแก้ว": 61,
    "สระบุรี": 62,
    "สิงห์บุรี": 63,
    "สุโขทัย": 64,
    "สุพรรณบุรี": 65,
    "สุราษฎร์ธานี": 66,
    "สุรินทร์": 67,
    "หนองคาย": 68,
    "หนองบัวลำภู": 69,
    "อ่างทอง": 70,
    "อำนาจเจริญ": 71,
    "อุดรธานี": 72,
    "อุตรดิตถ์": 73,
    "อุทัยธานี": 74,
    "อุบลราชธานี": 75,
    "ระยอง": 76,
    "เชียงราย": 77,
}

/**
 * Mapping from English province names to Makesend Province IDs
 */
export const ENGLISH_NAME_TO_MAKESEND: Record<string, number> = {
    "bangkok": 1,
    "krung thep": 1,
    "samut prakan": 2,
    "pathum thani": 3,
    "nonthaburi": 4,
    "nakhon pathom": 5,
    "samut sakhon": 6,
    "chon buri": 7,
    "chonburi": 7,
    "nakhon ratchasima": 8,
    "korat": 8,
    "samut songkhram": 9,
    "ratchaburi": 10,
    "phetchaburi": 11,
    "prachuap khiri khan": 12,
    "khon kaen": 13,
    "nakhon si thammarat": 14,
    "chiang mai": 15,
    "chiangmai": 15,
    "phetchabun": 16,
    "loei": 17,
    "phrae": 18,
    "mae hong son": 19,
    "krabi": 20,
    "kanchanaburi": 21,
    "kalasin": 22,
    "kamphaeng phet": 23,
    "chanthaburi": 24,
    "chachoengsao": 25,
    "chai nat": 26,
    "chaiyaphum": 27,
    "chumphon": 28,
    "trang": 29,
    "trat": 30,
    "tak": 31,
    "nakhon nayok": 32,
    "nakhon phanom": 33,
    "nakhon sawan": 34,
    "narathiwat": 35,
    "nan": 36,
    "bueng kan": 37,
    "buri ram": 38,
    "buriram": 38,
    "prachin buri": 39,
    "pattani": 40,
    "phra nakhon si ayutthaya": 41,
    "ayutthaya": 41,
    "phayao": 42,
    "phang nga": 43,
    "phangnga": 43,
    "phatthalung": 44,
    "phichit": 45,
    "phitsanulok": 46,
    "phuket": 47,
    "maha sarakham": 48,
    "mukdahan": 49,
    "yasothon": 50,
    "yala": 51,
    "roi et": 52,
    "ranong": 53,
    "lop buri": 54,
    "lopburi": 54,
    "lampang": 55,
    "lamphun": 56,
    "si sa ket": 57,
    "sisaket": 57,
    "sakon nakhon": 58,
    "songkhla": 59,
    "satun": 60,
    "sa kaeo": 61,
    "saraburi": 62,
    "sing buri": 63,
    "sukhothai": 64,
    "suphan buri": 65,
    "surat thani": 66,
    "surin": 67,
    "nong khai": 68,
    "nong bua lam phu": 69,
    "ang thong": 70,
    "amnat charoen": 71,
    "udon thani": 72,
    "uttaradit": 73,
    "uthai thani": 74,
    "ubon ratchathani": 75,
    "rayong": 76,
    "chiang rai": 77,
    "chiangrai": 77,
    "pattaya": 7,  // Special city in Chon Buri
}

/**
 * Parse ISO 3166-2:TH province code and return Makesend Province ID
 * @param code - Province code in format "TH-XX", "th-XX", or just "XX"
 * @returns Makesend Province ID or null if not found
 */
export function parseISOProvinceCode(code: string | undefined | null): number | null {
    if (!code) return null

    // Normalize: remove "TH-" or "th-" prefix, trim whitespace
    let isoCode = code.trim().toUpperCase()
    if (isoCode.startsWith("TH-")) {
        isoCode = isoCode.substring(3)
    }

    // Look up in mapping
    const makesendId = ISO_TO_MAKESEND_PROVINCE[isoCode]
    return makesendId ?? null
}

/**
 * Parse province name (Thai or English) and return Makesend Province ID
 * @param name - Province name in Thai or English
 * @returns Makesend Province ID or null if not found
 */
export function parseProvinceName(name: string | undefined | null): number | null {
    if (!name) return null

    const trimmed = name.trim()

    // Try Thai name first
    const thaiResult = THAI_NAME_TO_MAKESEND[trimmed]
    if (thaiResult) return thaiResult

    // Try English name (case-insensitive)
    const englishResult = ENGLISH_NAME_TO_MAKESEND[trimmed.toLowerCase()]
    if (englishResult) return englishResult

    return null
}

/**
 * Get Makesend Province ID from various formats
 * Supports: ISO 3166-2:TH codes, Thai names, English names, Makesend IDs
 * @param code - Province code in any supported format
 * @returns Makesend Province ID or null if not found
 */
export function getProvinceId(code: string | number | undefined | null): number | null {
    if (code === undefined || code === null) return null

    // If it's already a number, assume it's a Makesend ID
    if (typeof code === "number") {
        return code >= 1 && code <= 77 ? code : null
    }

    // Try ISO code first (TH-XX format)
    const isoResult = parseISOProvinceCode(code)
    if (isoResult) return isoResult

    // Try province name (Thai or English)
    const nameResult = parseProvinceName(code)
    if (nameResult) return nameResult

    // Try parsing as plain number (legacy support)
    const numericId = parseInt(code, 10)
    if (!isNaN(numericId) && numericId >= 1 && numericId <= 77) {
        return numericId
    }

    return null
}
