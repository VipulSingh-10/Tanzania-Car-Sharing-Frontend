# Quick Reference - Trip Service API Integration

## 🔥 Quick Start

### 1. **Import New Types**
```typescript
import { 
  DriverUpcomingTripDTO, 
  PassengerUpcomingRideDTO,
  TripSearchResultDTO 
} from '@/types/api';
```

### 2. **Get Driver's Upcoming Trips**
```typescript
const { data } = useQuery({
  queryKey: ['upcomingRides', userId],
  queryFn: () => apiService.getUpcomingRides(userId),
  enabled: !!userId,
});

const trips = data?.responseContent || []; // DriverUpcomingTripDTO[]
```

### 3. **Get Passenger's Upcoming Rides**
```typescript
const { data } = useQuery({
  queryKey: ['passengerRides', userId],
  queryFn: () => apiService.getMyUpcomingRidesAsPassenger(userId),
  enabled: !!userId,
});

const rides = data?.responseContent || []; // PassengerUpcomingRideDTO[]
```

### 4. **Search for Trips**
```typescript
// Search near location
const trips = await apiService.searchTripsNearSource(48.1371, 11.5754, 10);

// Search matching route
const trips = await apiService.searchTripsMatchingRoute(
  48.36, 10.68,  // source lat, lon
  48.13, 11.57,  // dest lat, lon
  5, 5           // radius in km
);
```

---

## 📊 Response Structures

### Driver's Trip Response
```typescript
{
  tripId: "68ec0a7968f0c407b33556cc",
  driverId: "driver@example.com",
  vehicleNumber: "ABC123",
  tripStatus: "OFFERED",
  sourceAddress: {
    latitude: 48.3638222,
    longitude: 10.6866494,
    placeAddress: "Augsburg, Germany"
  },
  destinationAddress: {
    latitude: 48.1371079,
    longitude: 11.5753822,
    placeAddress: "Munich, Germany"
  },
  tripStartDateTime: "2025-10-13T20:06:00+02:00",
  tripTimezone: "Europe/Berlin",
  offeredSeat: 3,
  availableSeats: 2,
  bookedSeats: 1,
  passengers: [
    {
      userId: "passenger@example.com",
      bookedSeats: 1,
      pickupLocation: {...},
      dropoffLocation: {...}
    }
  ],
  routeDistanceInKm: 83.65,
  routeDurationInMinutes: 62.16,
  pricePerKm: 10.0,
  estimatedEarnings: 836.50
}
```

---

## 🎨 UI Display Examples

### Display Trip Card
```typescript
<Card>
  <CardContent className="p-6">
    <div className="space-y-3">
      {/* Route */}
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4" />
        <span>{trip.sourceAddress.placeAddress} → {trip.destinationAddress.placeAddress}</span>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4" />
        <span>{new Date(trip.tripStartDateTime).toLocaleString()}</span>
      </div>

      {/* Distance & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>Distance: {trip.routeDistanceInKm.toFixed(1)} km</div>
        <div>Duration: {Math.round(trip.routeDurationInMinutes)} min</div>
      </div>

      {/* Seats */}
      <div className="flex items-center space-x-4">
        <span>{trip.availableSeats} available</span>
        <span>{trip.bookedSeats} booked</span>
      </div>

      {/* Earnings */}
      <div className="flex items-center space-x-1">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium">${trip.estimatedEarnings.toFixed(2)}</span>
      </div>

      {/* Status */}
      <span className={`px-2 py-1 rounded-full text-xs ${
        trip.tripStatus === 'OFFERED' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {trip.tripStatus}
      </span>
    </div>
  </CardContent>
</Card>
```

---

## 🔑 Key Field Mappings

### Trip Creation Request
| UI Field | API Field |
|----------|-----------|
| Vehicle Number | `vehicleNumber` (camelCase) |
| Pickup Location | `sourceAddress` |
| Destination | `destinationAddress` |
| Start Time | `tripStartDateTime` |
| Offered Seats | `offeredSeat` (singular) |

### Trip Response
| Display Name | API Field | Format |
|--------------|-----------|--------|
| From → To | `sourceAddress.placeAddress` → `destinationAddress.placeAddress` | String |
| Date/Time | `tripStartDateTime` | ISO-8601 with timezone |
| Distance | `routeDistanceInKm` | Number (km) |
| Duration | `routeDurationInMinutes` | Number (minutes) |
| Available Seats | `availableSeats` | Number |
| Booked Seats | `bookedSeats` | Number |
| Earnings | `estimatedEarnings` | Number (currency) |
| Status | `tripStatus` | "OFFERED" \| "IN_PROGRESS" \| "COMPLETED" \| "CANCELLED" |

---

## 🚨 Common Errors & Fixes

### Error: "Unauthorized (401)"
```javascript
// Check if token exists
const token = localStorage.getItem('carpoolToken');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}

// Check if token is expired
const payload = JSON.parse(atob(token.split('.')[1]));
if (Date.now() >= payload.exp * 1000) {
  // Token expired, re-login
  localStorage.removeItem('carpoolToken');
  window.location.href = '/login';
}
```

### Error: "CORS Policy"
This is a **backend issue**. Backend needs to add:
```java
.allowedOrigins("https://tanzania-car-sharing.netlify.app")
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
.allowedHeaders("*")
.allowCredentials(true)
```

### Error: "Field name mismatch"
Already handled in `apiService.createTrip()` with field mapping.

---

## 📱 Testing Commands

### Test in Browser Console
```javascript
// Get upcoming trips
const response = await fetch('https://api-gateway-yvbz.onrender.com/api/trips/my-trips/upcoming', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('carpoolToken'),
    'X-User-Id': localStorage.getItem('carpoolUserId')
  }
});
const data = await response.json();
console.log(data);
```

### Test with cURL (PowerShell)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "X-User-Id" = "vip@gmail.com"
}

Invoke-RestMethod -Uri "https://api-gateway-yvbz.onrender.com/api/trips/my-trips/upcoming" -Headers $headers
```

---

## 🎯 Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Display data |
| 201 | Created | Trip created successfully |
| 400 | Bad Request | Check field names/values |
| 401 | Unauthorized | Re-login required |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Trip doesn't exist |
| 500 | Server Error | Contact backend team |

---

## 🔄 Migration Checklist

When updating a component:
- [ ] Update imports to include new types
- [ ] Change `pickupPoint` → `sourceAddress`
- [ ] Change `destinationPoint` → `destinationAddress`
- [ ] Change `rideStartTime` → `tripStartDateTime`
- [ ] Change `seats` → `availableSeats` / `bookedSeats`
- [ ] Add distance display: `routeDistanceInKm`
- [ ] Add duration display: `routeDurationInMinutes`
- [ ] Add timezone display: `tripTimezone`
- [ ] Update status mapping for new values

---

## 📖 Related Files

- **Types:** `src/types/api.ts`
- **API Service:** `src/services/api.ts`
- **Dashboard:** `src/pages/Dashboard.tsx`
- **My Rides:** `src/pages/MyRides.tsx`
- **Full Documentation:** `BACKEND_INTEGRATION_SUMMARY.md`

---

**Quick Tip:** Use the browser's Network tab to debug API calls. Check the request payload and response to see exact data being sent/received.
