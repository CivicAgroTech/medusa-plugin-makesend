# Makesend Fulfillment Plugin for MedusaJS

A MedusaJS plugin that integrates [Makesend](https://www.makesend.asia/) logistics services for Thai e-commerce fulfillment. Built specifically for Medusa v2.11.3+.

[![npm version](https://badge.fury.io/js/medusa-plugin-makesend.svg)](https://www.npmjs.com/package/medusa-plugin-makesend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Fulfillment Provider** - Native integration using Medusa v2 fulfillment architecture
- ✅ **Shipping Rate Calculation** - Real-time pricing via Makesend `/order/calculateFee` API
- ✅ **Order Creation** - Automatically create Makesend shipments when fulfilling orders
- ✅ **Order Cancellation** - Cancel shipments through the Makesend API
- ✅ **Webhook Support** - Receive status updates and parcel size adjustments with automatic fulfillment tracking
- ✅ **Admin Tracking Widget** - View tracking information directly in order details page
- ✅ **Temperature Control** - Support for Normal, Chill, and Frozen deliveries
- ✅ **Postal Code Lookup** - Automatic Thai address validation and district mapping
- ✅ **Custom Workflows** - Integrated Medusa workflows for shipment creation and fulfillment
- ✅ **Testing Scripts** - Built-in webhook testing tools for local development

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
        // trackingBaseUrl: "https://app.makesend.asia",
        // labelBaseUrl: "https://app.makesend.asia",
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

Configure webhook URLs in your Makesend dashboard to receive automatic updates:

### Status Updates
**Endpoint**: `https://your-domain.com/store/makesend/webhook/status`

Automatically updates fulfillment tracking when shipment status changes. Supported status codes:
- `PENDING` - Order pending pickup
- `SHIPPED` - Package shipped
- `ARRIVED_HUB` - Arrived at hub
- `SORTED` - Package sorted
- `DELIVERING` - Out for delivery
- `DELIVERED` - Successfully delivered (marks fulfillment as delivered)
- `DELIVERY_FAILED` - Delivery attempt failed
- `RETURNED` - Returned to sender
- `CANCELED` - Shipment canceled

### Parcel Size Updates
**Endpoint**: `https://your-domain.com/store/makesend/webhook/parcel-size`

Receives notifications when actual parcel size differs from declared size.

### Testing Webhooks Locally

The plugin includes scripts for testing webhooks during development:

```bash
# Make script executable (Unix/Linux/macOS)
chmod +x scripts/test-webhooks.sh

# Test all webhooks
./scripts/test-webhooks.sh all

# Test with specific tracking ID and status
./scripts/test-webhooks.sh all --tracking EXSS2601121002503 --status DELIVERED

# Test only status webhook
./scripts/test-webhooks.sh status --tracking YOUR_TRACKING_ID

# Test only parcel size webhook
./scripts/test-webhooks.sh parcel-size --tracking YOUR_TRACKING_ID
```

See [scripts/README.md](scripts/README.md) for detailed testing documentation.

## API Routes

### Store Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/plugin` | GET | Plugin health check |
| `/store/makesend/webhook/status` | POST | Receive status update webhooks from Makesend |
| `/store/makesend/webhook/parcel-size` | POST | Receive parcel size update webhooks from Makesend |

### Admin Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/plugin` | GET | Admin plugin health check |
| `/admin/makesend/provinces` | GET | Get list of Thai provinces |
| `/admin/makesend/districts` | GET | Get districts filtered by province |
| `/admin/makesend/parcel-sizes` | GET | Get supported parcel sizes |
| `/admin/makesend/settings/makesend` | GET/POST | Get or update Makesend settings |

## Admin UI

The plugin provides several admin extensions:

### Makesend Tracking Widget
Displays on the order details page with:
- Tracking ID with external link to Makesend tracking
- Receiver information
- Pickup and delivery locations  
- Status history timeline with timestamps
- Delivery proof information (when available)

### Settings Page
Navigate to **Settings → Makesend** to configure:
- API credentials
- Sender information (name, phone, address)
- Default pickup location
- Default parcel sizes
- Temperature control preferences

## Reference Data

The plugin includes comprehensive Thai logistics data in the `/data` directory:

- `province.json` - Thai provinces (77 provinces)
- `district.json` - Districts with province associations
- `subDistrict.json` - Sub-districts with district associations
- `thailand_addresses.json` - Complete address database with postal codes
- `parcelSizeList.json` - Supported parcel sizes (S80, S100)
- `parcelTypeList.json` - Parcel type categories
- `pickupTimeSlotList.json` - Available pickup time slots
- `priceList.json` - Pricing reference data
- `shipmentStatusList.json` - Complete list of shipment status codes
- `bankCodeList.json` - Bank codes for COD transactions

## Custom Workflows

The plugin provides Medusa workflows for managing shipments:

### `createMakesendShipmentWorkflow`
Creates a shipment in Makesend when fulfilling an order. Automatically:
- Fetches shipping option and stock location details
- Creates Makesend order via API
- Returns shipment data for fulfillment

### `createMakesendFulfillmentWorkflow`
Complete fulfillment workflow that:
- Validates order and fulfillment data
- Creates Makesend shipment
- Updates fulfillment with tracking information

See [src/workflows/README.md](src/workflows/README.md) for workflow documentation.

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

# Test webhooks locally
./scripts/test-webhooks.sh
```

## Documentation

- [Makesend API Documentation](docs/MAKESEND_API.md) - Complete API reference
- [Supported Parcel Sizes](docs/SUPPORTED_PARCEL_SIZES.md) - Parcel size specifications
- [Webhook Testing Guide](scripts/README.md) - Testing webhooks locally

## Requirements

- Node.js >= 20
- MedusaJS v2.11.3 or higher
- Makesend API account and API key
- TypeScript 5.x (for development)

## Repository

- **GitHub**: [CivicAgroTech/medusa-plugin-makesend](https://github.com/CivicAgroTech/medusa-plugin-makesend)
- **NPM**: [medusa-plugin-makesend](https://www.npmjs.com/package/medusa-plugin-makesend)

## Author

**CivicAgrotech Co., Ltd.**  
Website: [https://civicagrotech.com](https://civicagrotech.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
