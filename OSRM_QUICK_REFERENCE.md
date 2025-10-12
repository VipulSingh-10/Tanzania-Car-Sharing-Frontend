# OSRM Integration - Quick Reference

## 🔄 Summary of Changes

### API Endpoint Changed
```diff
- POST /api/ride/create-trip
+ POST /api/trips/offer
```

### Request Body Field Names Changed
```diff
{
  "userId": "driver123",
  "requestContent": {
-   "vehicleNumber": "MH12AB1234",
+   "VehicleNumber": "MH12AB1234",
-   "pickupPoint": { ... },
+   "sourceAddress": { ... },
-   "destinationPoint": { ... },
+   "destinationAddress": { ... },
-   "tripStartTime": "2025-12-25T14:30:00+05:30",
+   "tripStartDateTime": "2025-12-25T14:30:00+05:30",
-   "offeredSeats": 3
+   "offeredSeat": 3
  }
}
```

### Response Body - New Fields Added
```typescript
{
  "responseContent": {
    "tripId": "507f1f77bcf86cd799439011",
    "vehicleNumber": "MH12AB1234",
    "sourceAddress": { ... },
    "destinationAddress": { ... },
    "tripStartDateTime": "2025-12-25T14:30:00+05:30",
    "tripTimezone": "Asia/Kolkata",
    
    // ⭐ NEW: Route information from OSRM
    "routeGeometry": {
      "type": "LineString",
      "coordinates": [[72.8777, 19.076], [72.88, 19.08], ...]
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

## 📊 What Users See Now

### Toast Notification (Before)
```
✅ Trip created successfully!
Your trip has been posted and is now available for others to join.
```

### Toast Notification (After)
```
✅ Trip created successfully!
Your trip has been posted and is now available for others to join. (Asia/Kolkata)
📍 Distance: 150.0 km
⏱️ Estimated duration: 120 minutes
```

## 🔍 Console Logging

Route data is automatically logged for debugging:

```javascript
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

## 🎯 Key Benefits

1. ✅ **Accurate Distance** - Real driving distance, not straight-line
2. ✅ **Realistic Duration** - Actual driving time based on road network
3. ✅ **Route Geometry** - Complete path for future map visualization
4. ✅ **Better UX** - Users immediately see trip details
5. ✅ **Data Consistency** - Route calculated once and stored

## 📁 Files Modified

| File | Changes |
|------|---------|
| `src/types/api.ts` | Added `Geometry` interface and route fields to `CreateTripResponseDTO` |
| `src/services/api.ts` | Updated endpoint and field mapping in `createTrip()` |
| `src/pages/CreateTrip.tsx` | Enhanced success message with distance and duration |
| `src/pages/RideOffering.tsx` | Enhanced success message with distance and duration |

## 🚀 Future Use Cases (Data Now Available)

### 1. Display Route on Map
```typescript
const route = tripInfo.routeGeometry;
// Draw polyline using coordinates
```

### 2. Calculate Trip Cost
```typescript
const cost = tripInfo.routeDistanceInKm * pricePerKm;
// Display estimated fare
```

### 3. Smart Ride Matching
```typescript
// Find riders whose pickup/drop points are near the route
// Use routeGeometry for geospatial queries
```

## ⚠️ Important Notes

- Route fields are **optional** - they may not be present if OSRM fails
- Always check if route data exists before using it
- Coordinates in `routeGeometry` are in `[longitude, latitude]` order (GeoJSON standard)
- Distance is provided in both meters and kilometers
- Duration is provided in both seconds and minutes

## 📞 Error Messages

| Scenario | Error Message |
|----------|--------------|
| Route not found | "Could not find a route between source and destination. Please check the addresses." |
| Time conflict | "Driver already has a trip at the same time. Please choose a different time." |
| OSRM service error | "Failed to calculate route. Please try again later." |

---

**Status**: ✅ Fully Aligned with Backend
**Last Updated**: October 12, 2025
