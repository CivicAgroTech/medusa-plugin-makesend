# Makesend Fulfillment Plugin for MedusaJS v2

A MedusaJS v2 plugin that integrates [Makesend](https://www.makesend.asia/) logistics services for Thai e-commerce fulfillment.

## Features

- ✅ **Fulfillment Provider** - Extends `AbstractFulfillmentProviderService` for seamless Medusa integration
- ✅ **Shipping Rate Calculation** - Real-time pricing via Makesend `/order/calculateFee` API
- ✅ **Order Creation** - Automatically create Makesend shipments when fulfilling orders
- ✅ **Order Cancellation** - Cancel shipments through the Makesend API
- ✅ **Webhook Support** - Receive status updates and parcel size adjustments
- ✅ **Admin Tracking Widget** - View tracking information in order details page
- ✅ **Temperature Control** - Support for Normal, Chill, and Frozen deliveries

## Installation

```bash
# Using yarn
yarn add medusa-plugin-makesend

# Using npm
npm install medusa-plugin-makesend
```

## Configuration

Add the plugin to your `medusa-config.ts`:

```typescript
import { defineConfig, Modules } from "@medusajs/framework/utils"

module.exports = defineConfig({
  // Register the fulfillment provider
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // Keep default manual provider
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          // Add Makesend provider
          {
            resolve: "medusa-plugin-makesend/providers/makesend",
            id: "makesend",
            options: {
              apiKey: process.env.MAKESEND_API_KEY,
            },
          },
        ],
      },
    },
  ],
  // Register the plugin for admin UI
  plugins: [
    {
      resolve: "medusa-plugin-makesend",
      options: {
        apiKey: process.env.MAKESEND_API_KEY,
      },
    },
  ],
})
```

### Environment Variables

```env
MAKESEND_API_KEY=your_makesend_api_key
```

## Fulfillment Options

The plugin provides three shipping options:

| Option ID | Name | Temperature |
|-----------|------|-------------|
| `makesend-standard` | Makesend Standard Delivery | Normal (0) |
| `makesend-chill` | Makesend Chill Delivery | Chill (1) |
| `makesend-frozen` | Makesend Frozen Delivery | Frozen (2) |

### Supported Parcel Sizes

| ID | Code | Size |
|----|------|------|
| 6 | s80 | S+ (S80) |
| 7 | s100 | M (S100) |

## Webhooks

Configure webhook URLs in your Makesend dashboard:

- **Status Updates**: `https://your-domain.com/store/makesend/webhook/status`
- **Parcel Size Updates**: `https://your-domain.com/store/makesend/webhook/parcel-size`

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/makesend/track/:id` | GET | Get tracking info for a shipment |
| `/store/makesend/webhook/status` | POST | Receive status update webhooks |
| `/store/makesend/webhook/parcel-size` | POST | Receive parcel size update webhooks |

## Admin UI

The plugin adds a **Makesend Tracking** widget to the order details page in Medusa Admin. The widget displays:

- Tracking ID with external link to Makesend
- Receiver information
- Pickup and delivery locations
- Status history timeline

## Reference Data

Province, district, and other reference data is available in the `/data` directory:

- `province.json` - Thai provinces
- `district.json` - Districts with province associations
- `subDistrict.json` - Sub-districts with district associations
- `parcelSizeList.json` - Available parcel sizes
- `parcelTypeList.json` - Parcel type categories
- `bankCodeList.json` - Bank codes for COD

## Currency Note

Makesend API uses **Satang** (1 Baht = 100 Satang) for all monetary values. The plugin handles this automatically when calculating prices.

## Development

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Run in development mode (with linked Medusa app)
yarn dev
```

## License

MIT
