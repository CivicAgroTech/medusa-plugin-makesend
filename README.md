# Makesend Fulfillment Plugin for MedusaJS

A MedusaJS plugin that integrates [Makesend](https://www.makesend.asia/) logistics services for Thai e-commerce fulfillment.

[![npm version](https://badge.fury.io/js/medusa-plugin-makesend.svg)](https://www.npmjs.com/package/medusa-plugin-makesend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

### 1. Add Environment Variables

Create or update your `.env` file:

```env
MAKESEND_API_KEY=your_makesend_api_key
```

### 2. Configure Medusa

Add the plugin to your `medusa-config.ts`:

```typescript
import { defineConfig } from "@medusajs/framework/utils"

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
              // Optional: Override API endpoints
              // baseUrl: "https://apis.makesend.asia",
              // trackingBaseUrl: "https://makesend.asia",
              // labelBaseUrl: "https://makesend.asia",
            },
          },
        ],
      },
    },
  ],
  // Register the plugin for admin UI and webhooks
  plugins: [
    {
      resolve: "medusa-plugin-makesend",
      options: {
        apiKey: process.env.MAKESEND_API_KEY,
        // Optional: Override API endpoints
        // baseUrl: "https://apis.makesend.asia/oapi/api",
        // trackingBaseUrl: "https://msgo.makesend.asia",
        // labelBaseUrl: "https://msgo.makesend.asia",
      },
    },
  ],
})
```

### 3. Create Shipping Options

After installation, create shipping options in Medusa Admin:

1. Navigate to **Settings → Fulfillment**
2. Select **Makesend** provider
3. Create shipping options using the fulfillment option IDs below

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

### Store Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/makesend/track/:id` | GET | Get tracking info for a shipment |
| `/store/makesend/webhook/status` | POST | Receive status update webhooks |
| `/store/makesend/webhook/parcel-size` | POST | Receive parcel size update webhooks |
| `/store/makesend/internal/stock-location/:id` | GET | Get internal stock location mapping |

### Admin Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/makesend/provinces` | GET | Get list of Thai provinces |
| `/admin/makesend/districts` | GET | Get list of districts (filtered by province) |
| `/admin/makesend/settings` | GET/POST | Get or update Makesend settings |

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

## Requirements

- Node.js >= 20
- MedusaJS v2.11.3 or higher
- Makesend API account and API key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/CivicAgroTech/medusa-makesend-fulfillment](https://github.com/CivicAgroTech/medusa-makesend-fulfillment)

## License

MIT
