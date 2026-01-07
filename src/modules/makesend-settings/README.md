# Makesend Settings Module

This module manages configuration settings for the Makesend fulfillment integration.

## Database Table

The module creates a `makesend_setting` table with the following fields:

- `id` - Primary key
- `originProvinceId` - Province ID for pickup location
- `originDistrictId` - District ID for pickup location
- `originProvinceName` - Province name for pickup location
- `originDistrictName` - District name for pickup location  
- `senderName` - Sender/company name
- `senderPhone` - Sender phone number
- `pickupAddress` - Pickup address
- `pickupPostcode` - Pickup postal code
- `timeCutoff` - Time cutoff for same-day shipments (HH:MM format)
- `supportedParcelSizes` - JSON array of supported parcel size codes
- Standard audit fields: `created_at`, `updated_at`, `deleted_at`

## Service Methods

### `getSettings()`
Returns the current settings record (there should only be one).

### `updateSettings(data)`
Updates the existing settings or creates new settings if none exist.

## Usage

The module is automatically registered when the plugin is installed. The settings are accessed via:

- Admin API at `/admin/makesend/settings`
- Admin UI at `/app/settings/makesend`
- Utility functions in `src/utils/settings.ts`
