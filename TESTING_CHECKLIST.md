# Testing Checklist for JWT Authentication

Use this checklist to verify that your JWT authentication is working correctly.

## Pre-Testing Setup

### Backend
- [ ] Auth Service is running
- [ ] User Service is running  
- [ ] Ride Service is running
- [ ] Vehicle Service is running
- [ ] API Gateway is running on port 8080
- [ ] All services are registered with Eureka (if using service discovery)
- [ ] Database connections are working

### Frontend
- [ ] `.env` file has correct `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Dependencies are installed (`bun install`)
- [ ] Dev server is running (`bun run dev`)
- [ ] No console errors on page load
- [ ] Browser localStorage is accessible (check in DevTools)

---

## 1. Signup Flow ✅

### Test Steps
1. Navigate to `/signup`
2. Fill in the form:
   - Full Name: `Test User`
   - Email: `test.user@example.com`
   - Password: `TestPassword123`
   - Phone: `+1234567890`
   - Age: `25`
   - Organization: `TestOrg`
3. Click "Create account"

### Expected Results
- [ ] No console errors
- [ ] Network request to `/api/auth/signup` (check DevTools → Network)
- [ ] Response contains `token` and `emailId`
- [ ] **Automatically logged in** (no redirect to login page)
- [ ] Redirected to `/dashboard`
- [ ] Token stored in localStorage (`carpoolToken`)
- [ ] User info stored in localStorage (`carpoolUser`)
- [ ] UserId stored in localStorage (`carpoolUserId`)

### Verification
```javascript
// Run in browser console
console.log('Token:', localStorage.getItem('carpoolToken'));
console.log('User ID:', localStorage.getItem('carpoolUserId'));
console.log('User Info:', localStorage.getItem('carpoolUser'));
```

---

## 2. Logout Flow ✅

### Test Steps
1. Click logout button in navigation

### Expected Results
- [ ] Redirected to `/login`
- [ ] LocalStorage cleared:
  - [ ] `carpoolToken` removed
  - [ ] `carpoolUserId` removed
  - [ ] `carpoolUser` removed

### Verification
```javascript
// Should all return null
console.log(localStorage.getItem('carpoolToken'));
console.log(localStorage.getItem('carpoolUserId'));
console.log(localStorage.getItem('carpoolUser'));
```

---

## 3. Login Flow ✅

### Test Steps
1. Navigate to `/login`
2. Enter credentials:
   - Email: `test.user@example.com`
   - Password: `TestPassword123`
3. Click "Sign in"

### Expected Results
- [ ] No console errors
- [ ] Network request to `/api/auth/login` (POST)
- [ ] Response contains `token` and `emailId`
- [ ] Second request to `/api/users/{emailId}` with Authorization header
- [ ] Redirected to `/dashboard`
- [ ] Token stored in localStorage
- [ ] Success toast message appears

### Verification in DevTools
1. Network Tab → Click on `/api/users/{emailId}` request
2. Check Request Headers:
   - [ ] `Authorization: Bearer eyJ...` is present
   - [ ] Token value matches localStorage

---

## 4. Protected Routes ✅

### Test Steps
1. Clear localStorage: `localStorage.clear()`
2. Try to access `/dashboard` directly

### Expected Results
- [ ] Immediately redirected to `/login`
- [ ] No dashboard content shown

### Test Steps (Logged In)
1. Login successfully
2. Access these routes:
   - [ ] `/dashboard`
   - [ ] `/profile`
   - [ ] `/vehicles`
   - [ ] `/find-rides`
   - [ ] `/my-rides`

### Expected Results
- [ ] All routes accessible
- [ ] No redirects to login
- [ ] Content loads properly

---

## 5. API Calls with Authentication ✅

### Test: Get User Profile
1. Login successfully
2. Navigate to `/profile`

### Verify in DevTools (Network Tab)
- [ ] Request to `/api/users/{emailId}`
- [ ] Request Headers include: `Authorization: Bearer <token>`
- [ ] Response status: `200 OK`
- [ ] Response body contains user info

### Test: Get User Vehicles
1. Navigate to `/vehicles`

### Verify in DevTools
- [ ] Request to `/api/vehicles/{userId}`
- [ ] Authorization header present
- [ ] Response status: `200 OK`

### Test: Find Rides
1. Navigate to `/find-rides`
2. Fill in search form
3. Click "Search"

### Verify in DevTools
- [ ] Request to `/api/rides/find-ride`
- [ ] Authorization header present
- [ ] Request body includes userId and requestContent
- [ ] Response contains ride list

### Test: Create Vehicle
1. Navigate to `/vehicles`
2. Click "Add Vehicle"
3. Fill in form and submit

### Verify in DevTools
- [ ] Request to `/api/vehicles/register`
- [ ] Authorization header present
- [ ] Vehicle created successfully

---

## 6. Token Expiration ✅

### Manual Test (If Backend Supports Short-Lived Tokens)
1. Login successfully
2. Wait for token to expire (or manually set expired token)
3. Try to access any protected route

### Expected Results
- [ ] Redirected to `/login`
- [ ] LocalStorage cleared
- [ ] Toast error message (optional)

### Force Expiration Test
```javascript
// In browser console
// Set an expired token
localStorage.setItem('carpoolToken', 'expired.token.here');
// Try to navigate to dashboard
window.location.href = '/dashboard';
```

### Expected Results
- [ ] Redirected to `/login`

---

## 7. Invalid Token Handling ✅

### Test Steps
1. Login successfully
2. Manually corrupt the token:
```javascript
localStorage.setItem('carpoolToken', 'invalid_token_12345');
```
3. Try to access `/dashboard`

### Expected Results
- [ ] API returns 401
- [ ] Automatically redirected to `/login`
- [ ] LocalStorage cleared

---

## 8. 401 Error Handling ✅

### Test with cURL (Backend Test)
```bash
# Test with invalid token
curl -X GET http://localhost:8080/api/users/test@example.com \
  -H "Authorization: Bearer invalid_token"
```

### Expected Backend Response
- [ ] Status: `401 Unauthorized`
- [ ] Error message about invalid token

### Frontend Behavior
- [ ] Catches 401 error
- [ ] Clears localStorage
- [ ] Redirects to `/login`

---

## 9. Page Refresh (Token Persistence) ✅

### Test Steps
1. Login successfully
2. Navigate to any page (e.g., `/dashboard`)
3. Press F5 or refresh the page

### Expected Results
- [ ] User remains logged in
- [ ] No redirect to login
- [ ] Token still in localStorage
- [ ] User info still in localStorage
- [ ] API calls still work with Authorization header

---

## 10. Multiple API Calls ✅

### Test Steps
1. Login successfully
2. Navigate to `/dashboard` (makes multiple API calls)

### Verify in DevTools (Network Tab)
- [ ] Request to `/api/users/{userId}` has Authorization header
- [ ] Request to `/api/myrides/upcoming` has Authorization header
- [ ] Request to `/api/vehicles/{userId}` has Authorization header
- [ ] All requests return `200 OK`
- [ ] All Authorization headers have the same token

---

## 11. Cross-Browser Testing ✅

### Test in Multiple Browsers
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

### Verify
- [ ] Login works in all browsers
- [ ] Token stored in localStorage in all browsers
- [ ] API calls work in all browsers
- [ ] Logout works in all browsers

---

## 12. CORS Testing ✅

### Verify CORS Configuration
1. Login successfully
2. Open browser console
3. Check for CORS errors

### Expected Results
- [ ] No CORS errors in console
- [ ] All API requests succeed
- [ ] Authorization header is sent (not blocked by CORS)

### If CORS Issues Exist
Backend must allow:
```java
allowedHeaders("Authorization", "Content-Type")
exposedHeaders("Authorization")
allowedMethods("GET", "POST", "PUT", "DELETE")
```

---

## 13. Error Scenarios ✅

### Test: Wrong Password
1. Try to login with wrong password

### Expected Results
- [ ] Error message displayed
- [ ] No token stored
- [ ] Remains on login page

### Test: Non-existent User
1. Try to login with email that doesn't exist

### Expected Results
- [ ] Error message displayed
- [ ] No token stored
- [ ] Remains on login page

### Test: Duplicate Signup
1. Try to signup with existing email

### Expected Results
- [ ] Error message displayed
- [ ] No token stored
- [ ] Remains on signup page

---

## 14. Security Checks ✅

### Verify Token Structure
```javascript
const token = localStorage.getItem('carpoolToken');
const parts = token.split('.');
console.log('Header:', atob(parts[0]));
console.log('Payload:', atob(parts[1]));
// Should see JWT structure
```

### Expected Token Payload
```json
{
  "sub": "user@example.com",
  "exp": 1234567890,
  "iat": 1234564290
}
```

### Verify Token is Not in URL
- [ ] Check browser URL - token should NOT appear in URL
- [ ] Check Network tab - token should be in headers, not URL

---

## 15. Performance Checks ✅

### Verify
- [ ] Login response time < 2 seconds
- [ ] API calls with auth complete < 1 second
- [ ] No duplicate API calls
- [ ] Token validation doesn't slow down requests

---

## Summary Report

After completing all tests, fill this out:

### Working ✅
- Signup: ☐ Yes ☐ No
- Login: ☐ Yes ☐ No
- Logout: ☐ Yes ☐ No
- Protected Routes: ☐ Yes ☐ No
- API Authentication: ☐ Yes ☐ No
- Token Persistence: ☐ Yes ☐ No
- Error Handling: ☐ Yes ☐ No

### Issues Found
```
List any issues discovered during testing:
1. 
2. 
3. 
```

### Notes
```
Additional observations:


```

---

## Quick Debug Commands

```javascript
// Check auth state
console.log('Token:', localStorage.getItem('carpoolToken'));
console.log('User:', localStorage.getItem('carpoolUser'));
console.log('Is Authenticated:', !!localStorage.getItem('carpoolToken'));

// Decode token
const token = localStorage.getItem('carpoolToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token Payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Time Until Expiry:', (payload.exp * 1000 - Date.now()) / 1000 / 60, 'minutes');
}

// Clear auth and test
localStorage.clear();
window.location.reload();

// Test API call manually
const token = localStorage.getItem('carpoolToken');
fetch('http://localhost:8080/api/users/test@example.com', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log);
```

---

**Testing Date**: __________
**Tested By**: __________
**Status**: ☐ All Passed ☐ Issues Found
