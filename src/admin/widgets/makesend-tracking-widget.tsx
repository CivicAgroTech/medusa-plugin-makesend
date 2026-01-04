/**
 * Makesend Tracking Widget
 * Displays tracking information for orders fulfilled by Makesend
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

/**
 * Tracking step from Makesend API
 */
interface TrackingStep {
    datetime: string
    status: string
    description: string
}

/**
 * Tracking response from API
 */
interface TrackingInfo {
    trackingID: string
    receiverName: string
    receiverPhone: string
    address: string
    pickupProvince: string
    pickupDistrict: string
    dropProvince: string
    dropDistrict: string
    step: TrackingStep[]
}

/**
 * Status color mapping
 */
const getStatusColor = (status: string): "green" | "orange" | "red" | "blue" | "grey" => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes("delivered")) return "green"
    if (lowerStatus.includes("delivering") || lowerStatus.includes("transit")) return "blue"
    if (lowerStatus.includes("failed") || lowerStatus.includes("cancel")) return "red"
    if (lowerStatus.includes("return")) return "orange"
    return "grey"
}

/**
 * Makesend Tracking Widget Component
 */
const MakesendTrackingWidget = () => {
    const { id: orderId } = useParams<{ id: string }>()
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [trackingId, setTrackingId] = useState<string | null>(null)

    // Check if order has Makesend fulfillment
    useEffect(() => {
        const checkFulfillment = async () => {
            if (!orderId) return

            try {
                // Fetch order details to check for Makesend fulfillment
                const response = await fetch(`/admin/orders/${orderId}?fields=*fulfillments`)
                if (!response.ok) return

                const data = await response.json()
                const order = data.order

                // Find Makesend fulfillment
                const makesendFulfillment = order?.fulfillments?.find(
                    (f: any) => f.data?.trackingID && f.provider_id === "makesend"
                )

                if (makesendFulfillment?.data?.trackingID) {
                    setTrackingId(makesendFulfillment.data.trackingID)
                }
            } catch (err) {
                console.error("Failed to check fulfillment:", err)
            }
        }

        checkFulfillment()
    }, [orderId])

    // Fetch tracking info when trackingId is available
    const fetchTracking = async () => {
        if (!trackingId) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/store/makesend/track/${trackingId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch tracking info")
            }

            const data = await response.json()
            setTrackingInfo(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch tracking")
        } finally {
            setLoading(false)
        }
    }

    // Don't render if no Makesend tracking
    if (!trackingId) {
        return null
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <Heading level="h2">Makesend Tracking</Heading>
                    <Badge color="blue">
                        {trackingId}
                    </Badge>
                </div>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={fetchTracking}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </div>

            {error && (
                <div className="px-6 py-4 bg-ui-bg-subtle-warning">
                    <Text className="text-ui-fg-error">{error}</Text>
                </div>
            )}

            {trackingInfo && (
                <div className="px-6 py-4 space-y-4">
                    {/* Receiver Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Text className="text-ui-fg-subtle text-sm">Receiver</Text>
                            <Text className="font-medium">{trackingInfo.receiverName}</Text>
                        </div>
                        <div>
                            <Text className="text-ui-fg-subtle text-sm">Phone</Text>
                            <Text className="font-medium">{trackingInfo.receiverPhone}</Text>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Text className="text-ui-fg-subtle text-sm">From</Text>
                            <Text className="font-medium">
                                {trackingInfo.pickupDistrict}, {trackingInfo.pickupProvince}
                            </Text>
                        </div>
                        <div>
                            <Text className="text-ui-fg-subtle text-sm">To</Text>
                            <Text className="font-medium">
                                {trackingInfo.dropDistrict}, {trackingInfo.dropProvince}
                            </Text>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    {trackingInfo.step && trackingInfo.step.length > 0 && (
                        <div>
                            <Text className="text-ui-fg-subtle text-sm mb-2">Status History</Text>
                            <div className="space-y-2">
                                {trackingInfo.step.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-2 rounded bg-ui-bg-subtle"
                                    >
                                        <Badge color={getStatusColor(step.status)} size="xsmall">
                                            {step.status}
                                        </Badge>
                                        <div className="flex-1">
                                            <Text className="text-sm">{step.datetime}</Text>
                                            {step.description && (
                                                <Text className="text-ui-fg-subtle text-sm">
                                                    {step.description}
                                                </Text>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* External Tracking Link */}
                    <div className="pt-2">
                        <a
                            href={`https://www.makesend.asia/tracking?id=${trackingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ui-fg-interactive hover:underline text-sm"
                        >
                            View on Makesend →
                        </a>
                    </div>
                </div>
            )}

            {!trackingInfo && !error && !loading && (
                <div className="px-6 py-4">
                    <Text className="text-ui-fg-subtle">
                        Click "Refresh" to load tracking information
                    </Text>
                </div>
            )}
        </Container>
    )
}

// Widget configuration - inject into order details page
export const config = defineWidgetConfig({
    zone: "order.details.after",
})

export default MakesendTrackingWidget
