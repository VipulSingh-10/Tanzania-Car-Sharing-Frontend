# Timezone Handling Implementation - Frontend

## Changes Made

### 1. Updated Components

#### `CreateTrip.tsx` (Offer Ride)
- ✅ Auto-detects user's timezone using browser API
- ✅ Formats datetime with timezone offset (ISO-8601: `yyyy-MM-dd'T'HH:mm:ssXXX`)
- ✅ Displays user's timezone in the UI
- ✅ Sends properly formatted datetime to backend
- ✅ Updated error handling to use new field names

#### `RideOffering.tsx`
- ✅ Auto-detects user's timezone using browser API
- ✅ Formats datetime with timezone offset (ISO-8601: `yyyy-MM-dd'T'HH:mm:ssXXX`)
- ✅ Displays user's timezone in the UI
- ✅ Sends properly formatted datetime to backend
- ✅ Updated error handling to use new field names

### 2. Updated Type Definitions (`src/types/api.ts`)

#### `CreateTripResponseDTO`
Updated to match backend response format:
```typescript
export interface CreateTripResponseDTO {
  tripId?: string;
  vehicleNumber?: string;
  sourceAddress?: Points;        // Changed from pickupPoint
  destinationAddress?: Points;   // Changed from destinationPoint
  tripStartDateTime?: string;    // Changed from tripStartTime
  tripTimezone?: string;         // New: IANA timezone ID
  tripCreated: boolean;
  errorMessage?: string;         // Changed from errMsg
}
```

## How It Works

### 1. Timezone Detection
```typescript
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Returns: "Asia/Kolkata", "Europe/Berlin", "America/New_York", etc.
```

### 2. DateTime Formatting
When user selects a date and time, the frontend:
1. Takes the local datetime input
2. Calculates the timezone offset
3. Formats it as ISO-8601 with timezone: `2025-12-25T14:30:00+05:30`
4. Sends it to the backend

Example:
- **User in India** (IST: +05:30) selects: Dec 25, 2025, 2:30 PM
- **Sent to backend**: `2025-12-25T14:30:00+05:30`
- **Stored in DB**: `2025-12-25T09:00:00Z` (UTC)
- **User in Germany** sees: Dec 25, 2025, 10:00 AM (their local time)

### 3. Format Function
```typescript
const formatDateTimeWithTimezone = (datetimeLocal: string): string => {
  const date = new Date(datetimeLocal);
  
  // Get timezone offset
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMinutes = Math.abs(timezoneOffset) % 60;
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';
  
  // Format: YYYY-MM-DDTHH:mm:ss±HH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
};
```

## UI Features

### Timezone Display
Both components now show:
- User's current timezone (e.g., "Asia/Kolkata")
- Helpful message: "Time will be displayed correctly for users in different timezones"
- Minimum datetime validation (cannot select past times)

### Success Messages
Trip creation success now includes timezone information when available:
```
"Your trip has been posted and is now available for others to join. (Asia/Kolkata)"
```

## Backend Integration

### Request Format (Offer Ride)
```json
{
  "userId": "driver123",
  "requestContent": {
    "vehicleNumber": "MH12AB1234",
    "pickupPoint": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "placeAddress": "Mumbai, India"
    },
    "destinationPoint": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "placeAddress": "Pune, India"
    },
    "tripStartTime": "2025-12-25T14:30:00+05:30",
    "offeredSeats": 3
  }
}
```

### Response Format
```json
{
  "responseContent": {
    "tripId": "507f1f77bcf86cd799439011",
    "vehicleNumber": "MH12AB1234",
    "sourceAddress": { ... },
    "destinationAddress": { ... },
    "tripStartDateTime": "2025-12-25T14:30:00+05:30",
    "tripTimezone": "Asia/Kolkata",
    "tripCreated": true,
    "errorMessage": null
  }
}
```

## Testing Scenarios

### Test Case 1: Indian User Creates Ride
- User in Mumbai (IST: +05:30)
- Selects: Dec 25, 2025, 2:30 PM
- Sends: `2025-12-25T14:30:00+05:30`
- Backend stores: `2025-12-25T09:00:00Z` (UTC)

### Test Case 2: German User Sees the Ride
- User in Berlin (CET: +01:00)
- Backend converts and shows: Dec 25, 2025, 10:00 AM
- Original time also displayed: "2:30 PM IST (10:00 AM your time)"

### Test Case 3: American User Sees the Ride
- User in New York (EST: -05:00)
- Backend converts and shows: Dec 25, 2025, 4:00 AM
- Original time also displayed: "2:30 PM IST (4:00 AM your time)"

## Benefits

✅ **Global Consistency**: All times stored in UTC in the database
✅ **User-Friendly**: Users see times in their local timezone
✅ **No Confusion**: Clear indication of timezone differences
✅ **Future-Proof**: Handles daylight saving time automatically
✅ **Accurate**: Uses browser's native timezone detection

## Map Integration

⚠️ **Note**: Map functionality remains unchanged and uses OpenStreetMap (as requested)
- LocationSearch component works with Nominatim API
- MapView component uses MapLibre GL
- No changes to map logic or providers

## Next Steps for Full Integration

To complete the timezone integration across the app:

1. **FindRides/RideBooking**: Update to display trip times in user's timezone
2. **MyRides**: Show both original and local times
3. **RideTracking**: Display real-time updates with correct timezone
4. **Dashboard**: Format upcoming ride times properly

## Console Logging

For debugging, the components log:
```javascript
console.log('Sending trip data with timezone:', {
  tripStartTime: formattedTripStartTime,
  userTimezone,
  originalInput: tripStartTime
});
```

This helps verify the correct format is being sent to the backend.
