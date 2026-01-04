/**
 * Makesend Service Area Settings Page
 * Admin page for configuring origin province and district
 * 
 * Route: /app/settings/makesend
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    Container,
    Heading,
    Text,
    Select,
    Button,
    Toaster,
    toast,
    Input,
    Label,
} from "@medusajs/ui"
import { Buildings } from "@medusajs/icons"
import { useState, useEffect } from "react"

interface Province {
    id: number
    name: string
}

interface District {
    id: number
    name: string
    provinceId: number
}

const MakesendSettingsPage = () => {
    const [provinces, setProvinces] = useState<Province[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>("")
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>("")

    // Sender information
    const [senderName, setSenderName] = useState<string>("")
    const [senderPhone, setSenderPhone] = useState<string>("")
    const [pickupAddress, setPickupAddress] = useState<string>("")
    const [pickupPostcode, setPickupPostcode] = useState<string>("")

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load provinces on mount
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const response = await fetch("/admin/makesend/provinces")
                const data = await response.json()
                setProvinces(data.provinces || [])
            } catch (error) {
                console.error("Failed to load provinces:", error)
                toast.error("Failed to load provinces")
            }
        }

        const loadSettings = async () => {
            try {
                const response = await fetch("/admin/makesend/settings")
                const data = await response.json()
                if (data.settings) {
                    if (data.settings.originProvinceId) {
                        setSelectedProvinceId(String(data.settings.originProvinceId))
                    }
                    if (data.settings.originDistrictId) {
                        setSelectedDistrictId(String(data.settings.originDistrictId))
                    }
                    // Load sender info
                    setSenderName(data.settings.senderName || "")
                    setSenderPhone(data.settings.senderPhone || "")
                    setPickupAddress(data.settings.pickupAddress || "")
                    setPickupPostcode(data.settings.pickupPostcode || "")
                }
            } catch (error) {
                console.error("Failed to load settings:", error)
            } finally {
                setLoading(false)
            }
        }

        loadProvinces()
        loadSettings()
    }, [])

    // Load districts when province changes
    useEffect(() => {
        const loadDistricts = async () => {
            if (!selectedProvinceId) {
                setDistricts([])
                return
            }

            try {
                const response = await fetch(
                    `/admin/makesend/districts?provinceId=${selectedProvinceId}`
                )
                const data = await response.json()
                setDistricts(data.districts || [])
            } catch (error) {
                console.error("Failed to load districts:", error)
                toast.error("Failed to load districts")
            }
        }

        loadDistricts()
    }, [selectedProvinceId])

    const handleProvinceChange = (value: string) => {
        setSelectedProvinceId(value)
        setSelectedDistrictId("") // Reset district when province changes
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            const selectedProvince = provinces.find(
                p => String(p.id) === selectedProvinceId
            )
            const selectedDistrict = districts.find(
                d => String(d.id) === selectedDistrictId
            )

            const response = await fetch("/admin/makesend/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    originProvinceId: selectedProvinceId ? parseInt(selectedProvinceId, 10) : null,
                    originDistrictId: selectedDistrictId ? parseInt(selectedDistrictId, 10) : null,
                    originProvinceName: selectedProvince?.name,
                    originDistrictName: selectedDistrict?.name,
                    senderName,
                    senderPhone,
                    pickupAddress,
                    pickupPostcode,
                }),
            })

            if (response.ok) {
                toast.success("Settings saved successfully")
            } else {
                throw new Error("Failed to save settings")
            }
        } catch (error) {
            console.error("Failed to save settings:", error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <Heading level="h1">Makesend Settings</Heading>
                </div>
                <div className="px-6 py-8">
                    <Text className="text-ui-fg-muted">Loading...</Text>
                </div>
            </Container>
        )
    }

    return (
        <>
            <Toaster />
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Buildings className="text-ui-fg-subtle" />
                        <div>
                            <Heading level="h1">Makesend Settings</Heading>
                            <Text className="text-ui-fg-subtle text-sm">
                                Configure your Makesend fulfillment integration
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-8">
                    {/* Sender Information Section */}
                    <div className="space-y-4">
                        <div>
                            <Heading level="h2" className="mb-2">Sender Information</Heading>
                            <Text className="text-ui-fg-subtle">
                                Configure the sender/pickup details for Makesend orders.
                            </Text>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="senderName">Sender Name (ชื่อผู้ส่ง)</Label>
                                <Input
                                    id="senderName"
                                    placeholder="e.g. My Shop Co., Ltd."
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senderPhone">Phone Number (เบอร์โทรศัพท์)</Label>
                                <Input
                                    id="senderPhone"
                                    placeholder="e.g. 0812345678"
                                    value={senderPhone}
                                    onChange={(e) => setSenderPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pickupAddress">Pickup Address (ที่อยู่รับสินค้า)</Label>
                            <Input
                                id="pickupAddress"
                                placeholder="e.g. 123 ถนนสุขุมวิท แขวงคลองตัน"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pickupPostcode">Postcode (รหัสไปรษณีย์)</Label>
                                <Input
                                    id="pickupPostcode"
                                    placeholder="e.g. 10110"
                                    value={pickupPostcode}
                                    onChange={(e) => setPickupPostcode(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Area Section */}
                    <div className="space-y-4">
                        <div>
                            <Heading level="h2" className="mb-2">Service Area</Heading>
                            <Text className="text-ui-fg-subtle">
                                Configure the origin province and district for Makesend shipments.
                            </Text>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Province Select */}
                            <div className="space-y-2">
                                <Label>Province (จังหวัด)</Label>
                                <Select
                                    value={selectedProvinceId}
                                    onValueChange={handleProvinceChange}
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder="Select a province" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {provinces.map((province) => (
                                            <Select.Item key={province.id} value={String(province.id)}>
                                                {province.name}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </div>

                            {/* District Select */}
                            <div className="space-y-2">
                                <Label>District (อำเภอ/เขต)</Label>
                                <Select
                                    value={selectedDistrictId}
                                    onValueChange={setSelectedDistrictId}
                                    disabled={!selectedProvinceId || districts.length === 0}
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder={
                                            !selectedProvinceId
                                                ? "Select a province first"
                                                : "Select a district"
                                        } />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {districts.map((district) => (
                                            <Select.Item key={district.id} value={String(district.id)}>
                                                {district.name}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </div>
                        </div>

                        {/* Selected Summary */}
                        {selectedProvinceId && (
                            <div className="p-4 bg-ui-bg-subtle rounded-lg">
                                <Text className="font-medium mb-2">Selected Origin:</Text>
                                <Text className="text-ui-fg-subtle">
                                    {provinces.find(p => String(p.id) === selectedProvinceId)?.name}
                                    {selectedDistrictId && (
                                        <> → {districts.find(d => String(d.id) === selectedDistrictId)?.name}</>
                                    )}
                                </Text>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !selectedProvinceId}
                            isLoading={saving}
                        >
                            Save Settings
                        </Button>
                    </div>
                </div>
            </Container>
        </>
    )
}

export const config = defineRouteConfig({
    label: "Makesend",
})

export default MakesendSettingsPage
