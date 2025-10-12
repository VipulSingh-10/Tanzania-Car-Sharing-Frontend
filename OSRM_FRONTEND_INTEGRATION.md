# OSRM Route Integration - Frontend Changes

## 📋 Overview
This document describes the frontend changes made to align with the OSRM (OpenStreetMap Routing Machine) integration in the backend. When a driver creates a trip, the backend now automatically calculates the route, distance, and duration using OSRM and returns this information to the frontend.

## 🔄 What Changed

### 1. Updated API Types (`src/types/api.ts`)

#### Added Geometry Interface
```typescript
// Geometry Type for Route (GeoJSON LineString)
export interface Geometry {
  type: string; // "LineString"
  coordinates: number[][]; // [[lon, lat], [lon, lat], ...]
}
```

#### Enhanced CreateTripResponseDTO
```typescript
export interface CreateTripResponseDTO {
  tripId?: string;
  vehicleNumber?: string;
  sourceAddress?: Points;
  destinationAddress?: Points;
  tripStartDateTime?: string;
  tripTimezone?: string;
  
  // NEW: Route information from OSRM
  routeGeometry?: Geometry; // Full route path as GeoJSON LineString
  routeDistanceInMeters?: number; // Distance in meters (e.g., 150000.0)
  routeDistanceInKm?: number; // Distance in kilometers (e.g., 150.0)
  routeDurationInSeconds?: number; // Duration in seconds (e.g., 7200.0)
  routeDurationInMinutes?: number; // Duration in minutes (e.g., 120.0)
  
  tripCreated: boolean;
  errorMessage?: string;
}
```

### 2. Updated API Service (`src/services/api.ts`)

Changed the endpoint and field mapping to match backend expectations:

```typescript
// Trip Creation (Offer Ride)
async createTrip(userId: string, tripData: OfferRideDTO): Promise<ResponseDTO<CreateTripResponseDTO>> {
  // Map frontend field names to backend field names
  const requestData = {
    userId,
    requestContent: {
      VehicleNumber: tripData.vehicleNumber,        // Capitalized
      sourceAddress: tripData.pickupPoint,           // Renamed from pickupPoint
      destinationAddress: tripData.destinationPoint, // Renamed from destinationPoint
      tripStartDateTime: tripData.tripStartTime,     // Renamed from tripStartTime
      offeredSeat: tripData.offeredSeats             // Renamed from offeredSeats
    }
  };
  
  return this.makeRequest('/api/trips/offer', {  // Updated endpoint
    method: 'POST',
    body: JSON.stringify(requestData),
  }, true);
}
```

### 3. Updated CreateTrip Component (`src/pages/CreateTrip.tsx`)

Enhanced success handler to display route information:

```typescript
onSuccess: (response) => {
  if (response.success && response.responseContent?.tripCreated) {
    const tripInfo = response.responseContent;
    const tripTimezoneInfo = tripInfo.tripTimezone ? ` (${tripInfo.tripTimezone})` : '';
    
    // Build success message with route information
    let description = `Your trip has been posted and is now available for others to join.${tripTimezoneInfo}`;
    
    // Add route information if available
    if (tripInfo.routeDistanceInKm && tripInfo.routeDurationInMinutes) {
      const distance = tripInfo.routeDistanceInKm.toFixed(1);
      const duration = Math.round(tripInfo.routeDurationInMinutes);
      description += `\n📍 Distance: ${distance} km\n⏱️ Estimated duration: ${duration} minutes`;
    }
    
    toast({
      title: 'Trip created successfully!',
      description,
    });
    
    console.log('Trip created with route data:', {
      tripId: tripInfo.tripId,
      distance: tripInfo.routeDistanceInKm,
      duration: tripInfo.routeDurationInMinutes,
      routeGeometry: tripInfo.routeGeometry
    });
    
    // ... rest of the code
  }
}
```

### 4. Updated RideOffering Component (`src/pages/RideOffering.tsx`)

Applied the same changes to display route information:

```typescript
if (response.success && response.responseContent?.tripCreated) {
  const tripInfo = response.responseContent;
  const tripTimezoneInfo = tripInfo.tripTimezone ? ` (${tripInfo.tripTimezone})` : '';
  
  // Build success message with route information
  let description = `Your ride has been successfully created and is now available for booking.${tripTimezoneInfo}`;
  
  // Add route information if available
  if (tripInfo.routeDistanceInKm && tripInfo.routeDurationInMinutes) {
    const distance = tripInfo.routeDistanceInKm.toFixed(1);
    const duration = Math.round(tripInfo.routeDurationInMinutes);
    description += `\n📍 Distance: ${distance} km\n⏱️ Estimated duration: ${duration} minutes`;
  }
  
  toast({
    title: 'Trip Created!',
    description,
  });
  
  console.log('Trip created with route data:', {
    tripId: tripInfo.tripId,
    distance: tripInfo.routeDistanceInKm,
    duration: tripInfo.routeDurationInMinutes,
    routeGeometry: tripInfo.routeGeometry
  });
  
  navigate('/my-rides');
}
```

## 📊 Request/Response Flow

### Request (Frontend → Backend)
```json
{
  "userId": "driver123",
  "requestContent": {
    "VehicleNumber": "MH12AB1234",
    "sourceAddress": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "placeAddress": "Mumbai, Maharashtra, India"
    },
    "destinationAddress": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "placeAddress": "Pune, Maharashtra, India"
    },
    "tripStartDateTime": "2025-12-25T14:30:00+05:30",
    "offeredSeat": 3
  }
}
```

### Response (Backend → Frontend)
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": {
    "tripId": "507f1f77bcf86cd799439011",
    "vehicleNumber": "MH12AB1234",
    "sourceAddress": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "placeAddress": "Mumbai, Maharashtra, India"
    },
    "destinationAddress": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "placeAddress": "Pune, Maharashtra, India"
    },
    "tripStartDateTime": "2025-12-25T14:30:00+05:30",
    "tripTimezone": "Asia/Kolkata",
    "routeGeometry": {
      "type": "LineString",
      "coordinates": [
        [72.8777, 19.0760],
        [72.8800, 19.0800],
        [72.9000, 19.1000],
        [73.8567, 18.5204]
      ]
    },
    "routeDistanceInMeters": 150000.0,
    "routeDistanceInKm": 150.0,
    "routeDurationInSeconds": 7200.0,
    "routeDurationInMinutes": 120.0,
    "tripCreated": true,
    "errorMessage": null
  }
}
```

## 🎨 User Experience Changes

### Before
When a trip was created, users only saw:
```
✅ Trip created successfully!
Your trip has been posted and is now available for others to join.
```

### After
Users now see route information:
```
✅ Trip created successfully!
Your trip has been posted and is now available for others to join. (Asia/Kolkata)
📍 Distance: 150.0 km
⏱️ Estimated duration: 120 minutes
```

## 🔧 Technical Details

### Field Name Mapping
| Frontend (OfferRideDTO) | Backend (OfferRideRequestDTO) |
|------------------------|-------------------------------|
| `vehicleNumber` | `VehicleNumber` (capitalized) |
| `pickupPoint` | `sourceAddress` |
| `destinationPoint` | `destinationAddress` |
| `tripStartTime` | `tripStartDateTime` |
| `offeredSeats` | `offeredSeat` (singular) |

### Endpoint Change
- **Old**: `POST /api/ride/create-trip`
- **New**: `POST /api/trips/offer`

### New Response Fields
All route fields are optional and will only be present if OSRM successfully calculated the route:

- `routeGeometry` - GeoJSON LineString with full route path
- `routeDistanceInMeters` - Precise distance in meters
- `routeDistanceInKm` - User-friendly distance in kilometers
- `routeDurationInSeconds` - Precise duration in seconds
- `routeDurationInMinutes` - User-friendly duration in minutes

## 📝 Console Logging

For debugging, trip creation now logs route data to console:

```javascript
console.log('Trip created with route data:', {
  tripId: tripInfo.tripId,
  distance: tripInfo.routeDistanceInKm,
  duration: tripInfo.routeDurationInMinutes,
  routeGeometry: tripInfo.routeGeometry
});
```

Example output:
```
Trip created with route data: {
  tripId: "507f1f77bcf86cd799439011",
  distance: 150.0,
  duration: 120.0,
  routeGeometry: {
    type: "LineString",
    coordinates: [[72.8777, 19.076], ...]
  }
}
```

## 🚀 Future Enhancements (Not Implemented Yet)

The route geometry data is now available for future features:

1. **Route Visualization on Map**
   ```typescript
   // Use routeGeometry to draw route on OpenStreetMap
   const route = response.routeGeometry;
   const coordinates = route.coordinates.map(coord => [coord[1], coord[0]]);
   // Draw polyline on map
   ```

2. **Trip Cost Calculation**
   ```typescript
   const pricePerKm = 10.0;
   const totalCost = response.routeDistanceInKm * pricePerKm;
   console.log(`Estimated cost: ₹${totalCost.toFixed(2)}`);
   ```

3. **Ride Matching along Route**
   - Use route geometry to find riders whose pickup/destination points are near the route
   - Calculate deviation from main route

## ⚠️ Error Handling

Possible error scenarios:

1. **Route Not Found**
   ```json
   {
     "tripCreated": false,
     "errorMessage": "Could not find a route between source and destination. Please check the addresses."
   }
   ```

2. **Time Conflict**
   ```json
   {
     "tripCreated": false,
     "errorMessage": "Driver already has a trip at the same time. Please choose a different time."
   }
   ```

3. **OSRM Service Error**
   ```json
   {
     "tripCreated": false,
     "errorMessage": "Failed to calculate route. Please try again later."
   }
   ```

## ✅ Testing Checklist

- [x] Updated type definitions to include route fields
- [x] Updated API service with correct endpoint and field mapping
- [x] Updated CreateTrip component to display route info
- [x] Updated RideOffering component to display route info
- [x] Added console logging for debugging
- [x] Maintained existing timezone handling functionality
- [x] Error messages displayed correctly
- [x] Success messages include route information

## 📚 Related Documentation

- `TIMEZONE_IMPLEMENTATION.md` - Timezone handling implementation
- `OSRM Route Integration Documentation` - Backend OSRM integration details
- Backend API: `POST /api/trips/offer` endpoint

## 🔍 Files Modified

1. `src/types/api.ts` - Added Geometry interface and route fields
2. `src/services/api.ts` - Updated createTrip method with field mapping
3. `src/pages/CreateTrip.tsx` - Enhanced success handler with route display
4. `src/pages/RideOffering.tsx` - Enhanced success handler with route display

---

**Last Updated**: October 12, 2025
**Status**: ✅ Complete and aligned with backend
