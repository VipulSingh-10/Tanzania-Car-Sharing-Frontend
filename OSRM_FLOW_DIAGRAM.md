# OSRM Integration - Visual Flow Diagram

## 📊 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRIP CREATION FLOW                        │
│                    (with OSRM Route Integration)                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   USER      │
│  (Driver)   │
└──────┬──────┘
       │
       │ 1. Fills form:
       │    - Pickup: Mumbai
       │    - Destination: Pune
       │    - Time: 2025-12-25 14:30
       │    - Vehicle: MH12AB1234
       │    - Seats: 3
       ↓
┌─────────────────────────────────────────────┐
│  FRONTEND                                    │
│  (CreateTrip.tsx / RideOffering.tsx)        │
└──────────────────┬──────────────────────────┘
       │
       │ 2. Formats data:
       │    - tripStartTime → tripStartDateTime (with timezone)
       │    - pickupPoint → sourceAddress
       │    - destinationPoint → destinationAddress
       ↓
┌─────────────────────────────────────────────┐
│  API SERVICE (api.ts)                        │
│  Maps field names for backend                │
└──────────────────┬──────────────────────────┘
       │
       │ 3. POST /api/trips/offer
       │    {
       │      "VehicleNumber": "MH12AB1234",
       │      "sourceAddress": { lat: 19.076, lng: 72.877, ... },
       │      "destinationAddress": { lat: 18.520, lng: 73.856, ... },
       │      "tripStartDateTime": "2025-12-25T14:30:00+05:30",
       │      "offeredSeat": 3
       │    }
       ↓
┌─────────────────────────────────────────────┐
│  BACKEND - Trip Service                      │
│  (OfferRideServiceImpl.java)                 │
└──────────────────┬──────────────────────────┘
       │
       │ 4. Validates request
       │    - Checks time conflicts
       │    - Validates vehicle
       ↓
┌─────────────────────────────────────────────┐
│  BACKEND - OSRM Client                       │
│  (OSMRoute.java)                             │
└──────────────────┬──────────────────────────┘
       │
       │ 5. Calls OSRM API:
       │    GET https://router.project-osrm.org/
       │        route/v1/driving/
       │        72.8777,19.0760;73.8567,18.5204
       │        ?overview=full&geometries=geojson
       ↓
┌─────────────────────────────────────────────┐
│  OSRM API (router.project-osrm.org)         │
│  - Calculates driving route                  │
│  - Returns geometry, distance, duration      │
└──────────────────┬──────────────────────────┘
       │
       │ 6. Returns:
       │    {
       │      "routes": [{
       │        "geometry": { "type": "LineString", "coordinates": [...] },
       │        "distance": 150000.0,
       │        "duration": 7200.0
       │      }]
       │    }
       ↓
┌─────────────────────────────────────────────┐
│  BACKEND - Trip Service                      │
│  Saves trip + route to MongoDB               │
└──────────────────┬──────────────────────────┘
       │
       │ 7. Stores in MongoDB:
       │    {
       │      "tripId": "507f...",
       │      "driverId": "driver123",
       │      "vehicleNumber": "MH12AB1234",
       │      "routeGeometry": { GeoJSON LineString },
       │      "routeDistance": 150000.0,
       │      "routeDuration": 7200.0,
       │      ...
       │    }
       ↓
┌─────────────────────────────────────────────┐
│  BACKEND - Response                          │
│  Returns trip + route data                   │
└──────────────────┬──────────────────────────┘
       │
       │ 8. Response:
       │    {
       │      "tripCreated": true,
       │      "tripId": "507f...",
       │      "routeGeometry": { GeoJSON },
       │      "routeDistanceInKm": 150.0,
       │      "routeDurationInMinutes": 120.0,
       │      ...
       │    }
       ↓
┌─────────────────────────────────────────────┐
│  FRONTEND - Success Handler                  │
│  (CreateTrip.tsx / RideOffering.tsx)        │
└──────────────────┬──────────────────────────┘
       │
       │ 9. Processes response:
       │    - Extracts route data
       │    - Formats for display
       │    - Logs to console
       ↓
┌─────────────────────────────────────────────┐
│  UI - Toast Notification                     │
│  Shows success message with route info       │
└──────────────────┬──────────────────────────┘
       │
       │ 10. Displays:
       │     ✅ Trip created successfully!
       │     Your trip has been posted. (Asia/Kolkata)
       │     📍 Distance: 150.0 km
       │     ⏱️ Estimated duration: 120 minutes
       ↓
┌─────────────┐
│   USER      │
│  Sees info  │
└─────────────┘
```

---

## 🔄 Field Name Transformations

```
FRONTEND → BACKEND

┌──────────────────────┐         ┌──────────────────────┐
│  OfferRideDTO        │         │ OfferRideRequestDTO  │
│  (Frontend)          │  ═══>   │ (Backend)            │
├──────────────────────┤         ├──────────────────────┤
│ vehicleNumber        │  ═══>   │ VehicleNumber        │
│ pickupPoint          │  ═══>   │ sourceAddress        │
│ destinationPoint     │  ═══>   │ destinationAddress   │
│ tripStartTime        │  ═══>   │ tripStartDateTime    │
│ offeredSeats         │  ═══>   │ offeredSeat          │
└──────────────────────┘         └──────────────────────┘
```

```
BACKEND → FRONTEND

┌──────────────────────────────┐         ┌──────────────────────────────┐
│ OfferRideResponseDTO         │         │ CreateTripResponseDTO        │
│ (Backend)                    │  ═══>   │ (Frontend)                   │
├──────────────────────────────┤         ├──────────────────────────────┤
│ tripId                       │  ═══>   │ tripId                       │
│ vehicleNumber                │  ═══>   │ vehicleNumber                │
│ sourceAddress                │  ═══>   │ sourceAddress                │
│ destinationAddress           │  ═══>   │ destinationAddress           │
│ tripStartDateTime            │  ═══>   │ tripStartDateTime            │
│ tripTimezone                 │  ═══>   │ tripTimezone                 │
│ routeGeometry                │  ═══>   │ routeGeometry        (NEW)   │
│ routeDistanceInMeters        │  ═══>   │ routeDistanceInMeters (NEW)  │
│ routeDistanceInKm            │  ═══>   │ routeDistanceInKm    (NEW)   │
│ routeDurationInSeconds       │  ═══>   │ routeDurationInSeconds (NEW) │
│ routeDurationInMinutes       │  ═══>   │ routeDurationInMinutes (NEW) │
│ tripCreated                  │  ═══>   │ tripCreated                  │
│ errorMessage                 │  ═══>   │ errorMessage                 │
└──────────────────────────────┘         └──────────────────────────────┘
```

---

## 📦 System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  CreateTrip.tsx │  │ RideOffering.tsx│  │  api.ts      │  │
│  │                 │  │                 │  │              │  │
│  │ - Form UI       │  │ - Form UI       │  │ - Endpoint   │  │
│  │ - Validation    │  │ - Validation    │  │ - Mapping    │  │
│  │ - Success toast │  │ - Success toast │  │ - Auth       │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
│            │                   │                    │          │
│            └───────────────────┴────────────────────┘          │
│                               │                                │
└───────────────────────────────┼────────────────────────────────┘
                                │
                    POST /api/trips/offer
                                │
┌───────────────────────────────┼────────────────────────────────┐
│                        BACKEND (Spring Boot)                    │
├───────────────────────────────┼────────────────────────────────┤
│                               ↓                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         OfferRideController.java                      │     │
│  │         POST /api/trips/offer                         │     │
│  └────────────────────────┬─────────────────────────────┘     │
│                           │                                    │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         OfferRideServiceImpl.java                     │     │
│  │         - Validates request                           │     │
│  │         - Checks conflicts                            │     │
│  │         - Calls OSRM service                          │     │
│  │         - Saves to MongoDB                            │     │
│  └────────────────────────┬─────────────────────────────┘     │
│                           │                                    │
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         OSMRoute.java (OSRM Client)                   │     │
│  │         - WebClient configuration                     │     │
│  │         - Calls router.project-osrm.org               │     │
│  │         - Returns route data                          │     │
│  └────────────────────────┬─────────────────────────────┘     │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                GET /route/v1/driving/{coords}
                            │
┌───────────────────────────┼────────────────────────────────────┐
│                 OSRM API (External Service)                     │
├───────────────────────────┼────────────────────────────────────┤
│                           ↓                                    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │   router.project-osrm.org                             │     │
│  │   - Calculates driving route                          │     │
│  │   - Returns geometry (GeoJSON)                        │     │
│  │   - Returns distance & duration                       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                            ↓

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│  Collection: trips                                               │
│  {                                                               │
│    "tripId": "507f1f77bcf86cd799439011",                        │
│    "driverId": "driver123",                                     │
│    "vehicleNumber": "MH12AB1234",                               │
│    "sourceAddress": { lat, lng, address },                      │
│    "destinationAddress": { lat, lng, address },                 │
│    "routeGeometry": { type: "LineString", coordinates: [...] }, │
│    "routeDistance": 150000.0,                                   │
│    "routeDuration": 7200.0,                                     │
│    "tripStartDateTimeUTC": "2025-12-25T09:00:00Z",             │
│    "tripTimezone": "Asia/Kolkata",                              │
│    ...                                                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Integration Points

### 1. Request Transformation (api.ts)
```typescript
// Frontend data
const tripData = {
  vehicleNumber: "MH12AB1234",
  pickupPoint: { ... },
  destinationPoint: { ... },
  tripStartTime: "2025-12-25T14:30:00+05:30",
  offeredSeats: 3
};

// Transformed for backend
const requestData = {
  VehicleNumber: tripData.vehicleNumber,
  sourceAddress: tripData.pickupPoint,
  destinationAddress: tripData.destinationPoint,
  tripStartDateTime: tripData.tripStartTime,
  offeredSeat: tripData.offeredSeats
};
```

### 2. Success Handler (CreateTrip.tsx)
```typescript
if (response.success && tripCreated) {
  // Extract route data
  const distance = tripInfo.routeDistanceInKm.toFixed(1);
  const duration = Math.round(tripInfo.routeDurationInMinutes);
  
  // Display to user
  toast({
    title: "Trip created successfully!",
    description: `📍 Distance: ${distance} km\n⏱️ Duration: ${duration} min`
  });
  
  // Log for debugging
  console.log({
    tripId: tripInfo.tripId,
    routeGeometry: tripInfo.routeGeometry,
    distance, duration
  });
}
```

### 3. Type Safety (api.ts types)
```typescript
interface Geometry {
  type: string;
  coordinates: number[][];
}

interface CreateTripResponseDTO {
  routeGeometry?: Geometry;
  routeDistanceInKm?: number;
  routeDurationInMinutes?: number;
  // ... other fields
}
```

---

**Status**: ✅ Complete Integration
**Last Updated**: October 12, 2025
