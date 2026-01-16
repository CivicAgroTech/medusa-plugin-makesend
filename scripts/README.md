# Makesend Webhook Mock Testing (Local Development)

This directory contains **local development scripts** for testing the Makesend webhook endpoints in the Medusa plugin. These scripts are intended for local development and testing only - they are not part of the published package.

## Files

- `test-webhooks.js` - Node.js script for testing webhooks
- `test-webhooks.ts` - TypeScript version with better type safety
- `test-webhooks.sh` - Shell script runner for Unix/Linux/macOS (recommended)
- `test-webhooks.bat` - Batch script runner for Windows
- `webhook-test-config.json` - Configuration file with test scenarios
- `README.md` - This documentation file

## Available Webhooks

### Status Update Webhook
**Endpoint:** `POST /store/makesend/webhook/status`

Receives shipment status updates from Makesend. Handles various status codes like:
- PENDING - Order is pending pickup
- SHIPPED - Package is shipped 
- DELIVERED - Package delivered successfully
- DELIVERY_FAILED - Delivery attempt failed
- RETURNED - Package returned to sender

### Parcel Size Update Webhook
**Endpoint:** `POST /store/makesend/webhook/parcel-size`

Receives notifications when actual parcel size differs from declared size, potentially incurring extra fees.

## Usage

### Quick Start (Recommended)

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x scripts/test-webhooks.sh

# Test all webhooks with default settings
./scripts/test-webhooks.sh

# Or on Windows
scripts\test-webhooks.bat
```

### Direct Script Usage

```bash
# Test all webhooks with default settings
node scripts/test-webhooks.js

# Or with TypeScript
npx ts-node scripts/test-webhooks.ts
```

### Testing Specific Webhooks

```bash
# Using shell script (recommended)
./scripts/test-webhooks.sh status
./scripts/test-webhooks.sh parcel
./scripts/test-webhooks.sh flow

# Or directly with Node.js
node scripts/test-webhooks.js --webhook status
node scripts/test-webhooks.js --webhook parcel-size
node scripts/test-webhooks.js --webhook flow
```

### Custom Test Data

```bash
# Using shell script
./scripts/test-webhooks.sh status --tracking MS1704672000123
./scripts/test-webhooks.sh parcel --host https://staging-api.yoursite.com

# Or directly with Node.js
node scripts/test-webhooks.js --tracking MS1704672000123
node scripts/test-webhooks.js --webhook status --status DELIVERED
node scripts/test-webhooks.js --webhook parcel-size --size XL --extra-fee 500
node scripts/test-webhooks.js --host https://staging-api.yoursite.com
```

### Load Testing

```bash
# Using shell script for load testing
./scripts/test-webhooks.sh load
./scripts/test-webhooks.sh load --count 20

# Or directly with Node.js
node scripts/test-webhooks.js --count 10 --delay 200
node scripts/test-webhooks.js --count 50 --delay 50
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host <url>` | Medusa server URL | `http://localhost:9000` |
| `--webhook <type>` | Webhook to test (status/parcel-size/flow/all) | `all` |
| `--tracking <id>` | Custom tracking ID | Random generated |
| `--alias <id>` | Custom alias ID | Random generated |
| `--status <code>` | Status code for status webhook | Random |
| `--size <code>` | Size code for parcel size webhook | Random |
| `--extra-fee <amount>` | Extra fee in satang | `0` |
| `--count <number>` | Number of test iterations | `1` |
| `--delay <ms>` | Delay between requests | `500` |
| `--help` | Show help message | - |

## Available Status Codes

- `PENDING` - Order pending pickup
- `SHIPPED` - Package shipped
- `ARRIVED_HUB` - Arrived at sorting hub
- `SORTED` - Sorted at hub
- `NOT_FOUND` - Package not found
- `ROTATING` - In transit between hubs
- `DELIVERING` - Out for delivery
- `DELIVERED` - Successfully delivered
- `DELIVERING_DELAY` - Delivery delayed
- `DELIVERED_DELAY` - Delivered but delayed
- `DELIVERY_FAILED` - Delivery attempt failed
- `DELIVERING_RE` - Re-delivery attempt
- `DELIVERED_RE` - Re-delivered successfully
- `RETURNED` - Returned to sender
- `RETURNING` - Being returned to sender
- `CANCELED` - Shipment cancelled

## Available Size Codes

- `XS` - Extra Small
- `S` - Small  
- `M` - Medium
- `L` - Large
- `XL` - Extra Large
- `XXL` - Extra Extra Large

## Test Scenarios

### Scenario 1: Quick Validation
Test all webhook endpoints with minimal data to verify basic functionality.

```bash
node scripts/test-webhooks.js --webhook all --count 1
```

### Scenario 2: Status Flow Simulation
Simulate a complete delivery journey from pending to delivered.

```bash
node scripts/test-webhooks.js --webhook flow
```

### Scenario 3: Error Conditions
Test error scenarios like delivery failures and returns.

```bash
node scripts/test-webhooks.js --webhook status --status DELIVERY_FAILED
node scripts/test-webhooks.js --webhook status --status RETURNED
```

### Scenario 4: Parcel Size Adjustments
Test parcel size changes with extra fees.

```bash
node scripts/test-webhooks.js --webhook parcel-size --size XL --extra-fee 1500
```

### Scenario 5: Load Testing
Test webhook performance with multiple rapid requests.

```bash
node scripts/test-webhooks.js --webhook all --count 20 --delay 100
```

## Expected Responses

### Successful Response
```json
{
  "success": true,
  "message": "Webhook received", 
  "trackingID": "MS1704672000123"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Troubleshooting

### Connection Refused
- Ensure Medusa server is running
- Check the host URL is correct
- Verify network connectivity

### 404 Not Found
- Verify the webhook routes are properly registered
- Check Medusa routing configuration
- Ensure plugin is installed and enabled

### 500 Internal Server Error
- Check Medusa server logs for detailed error messages
- Verify webhook payload format matches expected interface
- Check database connectivity if webhooks update data

### Authentication Errors
- Some deployments may require authentication headers
- Add authentication tokens to the script if needed

## Integration with CI/CD

The webhook test scripts can be integrated into automated testing pipelines:

```bash
# Run webhook tests as part of integration tests
npm run test:webhooks

# Or add to package.json scripts:
# "test:webhooks": "node scripts/test-webhooks.js --webhook all --count 3"
```

## Monitoring and Logging

The webhook handlers log important information. Monitor these logs when testing:

```bash
# Follow Medusa logs during testing
tail -f /path/to/medusa/logs/medusa.log

# Or use Docker logs if running in container
docker logs -f medusa-container
```

## Security Considerations

- In production, implement webhook signature verification
- Use HTTPS endpoints for webhook URLs
- Consider rate limiting on webhook endpoints
- Validate and sanitize all webhook payload data

## Contributing

When adding new webhook functionality:

1. Update the webhook handlers in `src/api/store/makesend/webhook/`
2. Add corresponding test scenarios to this script
3. Update the available status codes or payload interfaces
4. Document new webhook behavior in this README