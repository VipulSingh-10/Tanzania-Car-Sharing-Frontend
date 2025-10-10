# API Testing Examples

## Using cURL

### 1. Signup (Create Account)
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "emailId": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "SecurePassword123",
    "age": 30,
    "organisationName": "TechCorp"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "emailId": "john.doe@example.com"
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "emailId": "john.doe@example.com"
  }
}
```

### 3. Get User Info (Authenticated)
```bash
# Save the token from login/signup
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/users/john.doe@example.com \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "errorMessage": null,
  "responseContent": {
    "userId": "john.doe@example.com",
    "emailId": "john.doe@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "age": 30,
    "organisationName": "TechCorp",
    "profilePicUrl": null
  }
}
```

### 4. Find Rides (Authenticated)
```bash
curl -X POST http://localhost:8080/api/rides/find-ride \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john.doe@example.com",
    "requestContent": {
      "pickupPoint": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "placeAddress": "New York, NY"
      },
      "destinationPoint": {
        "latitude": 34.0522,
        "longitude": -118.2437,
        "placeAddress": "Los Angeles, CA"
      },
      "rideStartTime": "2025-10-15T10:00:00",
      "requestedSeats": 2
    }
  }'
```

### 5. Create Trip (Authenticated)
```bash
curl -X POST http://localhost:8080/api/ride/create-trip \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john.doe@example.com",
    "requestContent": {
      "vehicleNumber": "ABC123",
      "pickupPoint": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "placeAddress": "New York, NY"
      },
      "destinationPoint": {
        "latitude": 34.0522,
        "longitude": -118.2437,
        "placeAddress": "Los Angeles, CA"
      },
      "tripStartTime": "2025-10-15T10:00:00",
      "offeredSeats": 3
    }
  }'
```

### 6. Get User Vehicles (Authenticated)
```bash
curl -X GET http://localhost:8080/api/vehicles/john.doe@example.com \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 7. Register Vehicle (Authenticated)
```bash
curl -X POST http://localhost:8080/api/vehicles/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john.doe@example.com",
    "requestContent": {
      "vehicleName": "Tesla Model 3",
      "vehicleNumber": "ABC123",
      "vehicleType": "Sedan",
      "vehicleColor": "Blue",
      "seatingCapacity": "4"
    }
  }'
```

### 8. Get Upcoming Rides (Authenticated)
```bash
curl -X POST http://localhost:8080/api/myrides/upcoming \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john.doe@example.com",
    "requestContent": null
  }'
```

### 9. Test Invalid Token (Should return 401)
```bash
curl -X GET http://localhost:8080/api/users/john.doe@example.com \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "errorMessage": "Unauthorized",
  "responseContent": null
}
```

## Using Postman

### Setup
1. Create a new Collection: "Carpool API"
2. Add Collection Variable: `baseUrl` = `http://localhost:8080`
3. Add Collection Variable: `token` = (empty, will be set after login)

### Login Request
```
POST {{baseUrl}}/api/auth/login
Body (raw JSON):
{
  "emailId": "john.doe@example.com",
  "password": "SecurePassword123"
}

Tests (to save token):
pm.test("Login successful", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.collectionVariables.set("token", jsonData.responseContent.token);
});
```

### Authenticated Requests
For all authenticated requests, add to Headers:
```
Authorization: Bearer {{token}}
```

## Using JavaScript (Browser Console)

### Login and Store Token
```javascript
// Login
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailId: 'john.doe@example.com',
    password: 'SecurePassword123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.responseContent.token;
console.log('Token:', token);

// Store in localStorage
localStorage.setItem('carpoolToken', token);
```

### Make Authenticated Request
```javascript
// Get user info
const token = localStorage.getItem('carpoolToken');

const userResponse = await fetch('http://localhost:8080/api/users/john.doe@example.com', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const userData = await userResponse.json();
console.log('User Info:', userData);
```

## Testing Checklist

### Authentication Tests
- [ ] Signup with new user → Should return token
- [ ] Login with correct credentials → Should return token
- [ ] Login with incorrect password → Should return error
- [ ] Login with non-existent user → Should return error

### Authenticated Endpoint Tests
- [ ] Access protected endpoint with valid token → Should succeed
- [ ] Access protected endpoint without token → Should return 401
- [ ] Access protected endpoint with expired token → Should return 401
- [ ] Access protected endpoint with invalid token → Should return 401

### Token Validation Tests
- [ ] Token includes correct payload (emailId, exp, iat)
- [ ] Token signature is valid
- [ ] Token expiration time is reasonable (not too short/long)

### Frontend Integration Tests
- [ ] Login → Token stored in localStorage
- [ ] All API calls include Authorization header
- [ ] 401 response → Clear localStorage and redirect to login
- [ ] Logout → Clear localStorage

## Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Invalid/missing/expired token
- **403 Forbidden** - Token valid but user doesn't have permission
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Debugging Tips

### Check Token Content
```javascript
const token = localStorage.getItem('carpoolToken');
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token Payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Issued:', new Date(payload.iat * 1000));
  console.log('Subject (User):', payload.sub);
}
```

### Verify Token is Being Sent
Open Browser DevTools:
1. Go to Network tab
2. Make an API request
3. Click on the request
4. Check "Request Headers" section
5. Look for: `Authorization: Bearer eyJ...`

### Check Token Validation on Backend
Add logging in your API Gateway:
```java
log.info("Received token: {}", token);
log.info("Token valid: {}", isValid);
log.info("User from token: {}", emailId);
```

## Environment-Specific URLs

### Development
```
API_BASE_URL=http://localhost:8080
```

### Production
```
API_BASE_URL=https://api.yourcarpool.com
```

Make sure your backend CORS configuration allows requests from your frontend domain!
