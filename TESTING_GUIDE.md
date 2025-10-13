# 🧪 Testing Guide - Dashboard & Backend Integration

## ✅ Fixed Issues

### Dashboard.tsx
- **Fixed:** Broken HTML structure with mismatched closing tags
- **Fixed:** Incorrect field references (updated to match new API response)
- **Fixed:** Status badge logic updated for new trip statuses
- **Improved:** Better layout and spacing for trip information

---

## 🔍 Quick Tests

### 1. **Test Dashboard Loading**

Open your browser console and run:

```javascript
// Check if user is logged in
console.log('User Info:', localStorage.getItem('carpoolUser'));
console.log('Token:', localStorage.getItem('carpoolToken'));
console.log('User ID:', localStorage.getItem('carpoolUserId'));

// If token exists, check if it's valid
const token = localStorage.getItem('carpoolToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token Payload:', payload);
  console.log('Token Expires:', new Date(payload.exp * 1000));
  console.log('Is Expired?:', Date.now() >= payload.exp * 1000);
}
```

### 2. **Test API Calls Manually**

```javascript
// Test get upcoming rides
const token = localStorage.getItem('carpoolToken');
const userId = localStorage.getItem('carpoolUserId');

fetch('https://api-gateway-yvbz.onrender.com/api/trips/my-trips/upcoming', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Upcoming Rides:', data))
.catch(err => console.error('Error:', err));
```

### 3. **Test Trip Creation**

```javascript
const token = localStorage.getItem('carpoolToken');
const userId = localStorage.getItem('carpoolUserId');

fetch('https://api-gateway-yvbz.onrender.com/api/trips/offer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId,
    requestContent: {
      vehicleNumber: 'TEST123',
      sourceAddress: {
        latitude: 48.1351,
        longitude: 11.5820,
        placeAddress: 'Munich, Germany'
      },
      destinationAddress: {
        latitude: 48.3638,
        longitude: 10.6866,
        placeAddress: 'Augsburg, Germany'
      },
      tripStartDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      offeredSeat: 2
    }
  })
})
.then(res => res.json())
.then(data => console.log('Trip Created:', data))
.catch(err => console.error('Error:', err));
```

---

## 🐛 Common Errors & Solutions

### Error 1: "Cannot read property 'sourceAddress' of undefined"
**Cause:** API returned null or empty response
**Solution:** 
- Check if backend is running
- Verify token is valid
- Check network tab for actual response

### Error 2: "401 Unauthorized"
**Cause:** Token is invalid or expired
**Solution:**
```javascript
// Clear and re-login
localStorage.clear();
window.location.href = '/login';
```

### Error 3: "CORS Policy Error"
**Cause:** Backend not configured for Netlify domain
**Solution:** Backend needs to update CORS configuration

### Error 4: Dashboard shows "No upcoming trips" but you created trips
**Possible causes:**
1. Trip creation failed (check console for errors)
2. Wrong userId in request
3. Backend not saving trips properly

**Debug:**
```javascript
// Check what API is returning
fetch('https://api-gateway-yvbz.onrender.com/api/trips/my-trips/upcoming', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('carpoolToken'),
    'X-User-Id': localStorage.getItem('carpoolUserId')
  }
})
.then(res => res.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Success?', data.success);
  console.log('Trips:', data.responseContent);
});
```

---

## 📱 Page-by-Page Checklist

### ✅ Dashboard (`/dashboard`)
- [ ] Shows welcome message with user's name
- [ ] Displays correct count of upcoming rides
- [ ] Displays correct count of vehicles
- [ ] Quick action buttons work (Find Ride, Create Trip, Vehicles)
- [ ] Upcoming rides list shows trips (if any exist)
- [ ] Each trip shows:
  - [ ] Source → Destination
  - [ ] Date/Time
  - [ ] Vehicle number
  - [ ] Available/booked seats
  - [ ] Distance and duration
  - [ ] Status badge with color

### ✅ My Rides (`/my-rides`)
- [ ] Shows two tabs: Upcoming Rides, Ride History
- [ ] Upcoming tab shows driver's trips
- [ ] Each trip shows:
  - [ ] Full route information
  - [ ] Passenger list (if any)
  - [ ] Estimated earnings
  - [ ] Distance and duration
  - [ ] Status with correct color
- [ ] Cancel button works (if status is OFFERED)

### ✅ Create Trip (`/create-trip`)
- [ ] Form loads correctly
- [ ] Vehicle dropdown shows user's vehicles
- [ ] Location search works
- [ ] Date/time picker works
- [ ] Submit button creates trip
- [ ] Success message shows distance/duration
- [ ] Redirects to My Rides after creation

### ✅ Login (`/login`)
- [ ] Email and password fields work
- [ ] Submit logs in successfully
- [ ] Token is stored
- [ ] Redirects to dashboard
- [ ] User info loads after login

---

## 🚀 Performance Tests

### Check API Response Times
```javascript
async function testPerformance() {
  const token = localStorage.getItem('carpoolToken');
  const userId = localStorage.getItem('carpoolUserId');
  
  const endpoints = [
    '/api/trips/my-trips/upcoming',
    '/api/vehicles/' + userId,
    '/api/users/' + userId
  ];
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const response = await fetch('https://api-gateway-yvbz.onrender.com' + endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      });
      const end = Date.now();
      console.log(`${endpoint}: ${end - start}ms`, response.ok ? '✅' : '❌');
    } catch (error) {
      console.error(`${endpoint}: Failed`, error);
    }
  }
}

testPerformance();
```

---

## 📊 Expected Response Structures

### Upcoming Trips Response
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": [
    {
      "tripId": "68ec0a7968f0c407b33556cc",
      "driverId": "driver@example.com",
      "vehicleNumber": "ABC123",
      "tripStatus": "OFFERED",
      "sourceAddress": {
        "latitude": 48.3638222,
        "longitude": 10.6866494,
        "placeAddress": "Augsburg, Germany"
      },
      "destinationAddress": {
        "latitude": 48.1371079,
        "longitude": 11.5753822,
        "placeAddress": "Munich, Germany"
      },
      "tripStartDateTime": "2025-10-13T20:06:00+02:00",
      "tripTimezone": "Europe/Berlin",
      "offeredSeat": 3,
      "availableSeats": 2,
      "bookedSeats": 1,
      "passengers": [],
      "routeDistanceInKm": 83.65,
      "routeDurationInMinutes": 62.16,
      "pricePerKm": 10.0,
      "estimatedEarnings": 836.50
    }
  ]
}
```

### Trip Creation Response
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": {
    "tripId": "68ec0a7968f0c407b33556cc",
    "vehicleNumber": "ABC123",
    "sourceAddress": {...},
    "destinationAddress": {...},
    "tripStartDateTime": "2025-10-13T20:06:00+02:00",
    "tripTimezone": "Europe/Berlin",
    "routeGeometry": {...},
    "routeDistanceInMeters": 83654.7,
    "routeDistanceInKm": 83.65,
    "routeDurationInSeconds": 3729.7,
    "routeDurationInMinutes": 62.16,
    "tripCreated": true,
    "errorMessage": null
  }
}
```

---

## 🔧 Development Tools

### Useful Browser Extensions
- **React Developer Tools** - Inspect React components
- **Redux DevTools** - Debug state management (if using Redux)
- **JSON Viewer** - Format API responses

### VS Code Extensions
- **ESLint** - Catch errors before runtime
- **Prettier** - Auto-format code
- **Error Lens** - Show errors inline

---

## 📝 Checklist Before Deployment

- [ ] All TypeScript errors fixed
- [ ] All ESLint warnings addressed
- [ ] Environment variables set in `.env.production`
- [ ] API URLs point to production backend
- [ ] CORS configured on backend for production domain
- [ ] Test login flow end-to-end
- [ ] Test trip creation end-to-end
- [ ] Test dashboard loads correctly
- [ ] Test all navigation links work
- [ ] Test error handling (try with invalid data)
- [ ] Test with expired token
- [ ] Clear browser cache before final test

---

## 🎯 Next Steps After Backend CORS Fix

Once backend adds CORS support for `https://tanzania-car-sharing.netlify.app`:

1. **Rebuild Frontend:**
   ```powershell
   npm run build
   ```

2. **Deploy to Netlify:**
   - Push to GitHub
   - Netlify auto-deploys

3. **Test Production:**
   - Open https://tanzania-car-sharing.netlify.app
   - Login
   - Create a trip
   - Check dashboard

4. **Monitor Errors:**
   - Open browser console
   - Check for any errors
   - Verify all API calls succeed

---

**Good luck with testing! 🚀**
