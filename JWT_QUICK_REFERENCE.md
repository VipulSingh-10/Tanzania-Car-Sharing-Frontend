# Quick Reference: JWT Authentication Integration

## What Changed?

Your frontend now uses JWT tokens for authentication instead of simple session-based auth.

## Key Files Modified

1. **`src/types/api.ts`** - Updated DTOs to match backend
2. **`src/contexts/AuthContext.tsx`** - Added token management
3. **`src/services/api.ts`** - Added JWT header to all authenticated requests
4. **`src/pages/Login.tsx`** - Updated to handle JWT response
5. **`src/pages/Signup.tsx`** - Updated to handle JWT response and auto-login
6. **`src/components/ProtectedRoute.tsx`** - Added token validation
7. **`src/lib/auth-utils.ts`** - NEW: Auth utility functions

## How It Works Now

### Before (Old System):
```typescript
// Login
apiService.login(data) 
  → Returns: { loginSuccess, userId, errMsg }
  → Store: userId in localStorage
  → No authentication headers on subsequent requests
```

### After (New JWT System):
```typescript
// Login
apiService.login(data)
  → Returns: { token, emailId }
  → Store: token in localStorage
  → All authenticated requests include: Authorization: Bearer <token>
```

## Important Changes for Development

### 1. API Endpoints Changed
```typescript
// OLD
'/users/login'
'/users/signup'

// NEW
'/api/auth/login'      // No auth required
'/api/auth/signup'     // No auth required
'/api/users/*'         // Auth required ✓
'/api/rides/*'         // Auth required ✓
'/api/myrides/*'       // Auth required ✓
'/api/vehicles/*'      // Auth required ✓
```

### 2. Login Flow
```typescript
// Login response now includes JWT token
const response = await apiService.login({ emailId, password });
// response.responseContent = { token: "eyJ...", emailId: "user@example.com" }

// Token is automatically used for subsequent authenticated requests
```

### 3. Signup Flow
```typescript
// Signup now auto-logs the user in
const response = await apiService.signup(userData);
// User is automatically logged in with the returned token
// No need to redirect to /login
```

### 4. Making Authenticated Requests
```typescript
// No changes needed in your code!
// The API service automatically adds the token to requests

// Example: This automatically includes Authorization header
await apiService.getUserInfo(userId);
await apiService.findRides(userId, rideData);
```

### 5. Token Storage
```typescript
// Token is stored in localStorage
localStorage.getItem('carpoolToken')        // JWT token
localStorage.getItem('carpoolUserId')       // User's email
localStorage.getItem('carpoolUser')         // User info JSON
```

### 6. Automatic Logout on Token Expiration
```typescript
// If backend returns 401 or 403:
// - Auth data is cleared automatically
// - User is redirected to /login
// No manual handling needed!
```

## Testing Your Changes

### 1. Test Login
```bash
# Start your frontend
bun run dev

# Try logging in with existing credentials
# Check browser console for:
# - "Using API URL: <your-api-url>"
# - Network tab: Authorization header in requests
```

### 2. Test Signup
```bash
# Create a new account
# You should be logged in automatically
# No redirect to login page
```

### 3. Check Token in Requests
```bash
# Open browser DevTools → Network tab
# Look at any API request to /api/users, /api/rides, etc.
# Request Headers should include:
# Authorization: Bearer eyJhbGc...
```

### 4. Test Protected Routes
```bash
# Clear localStorage
localStorage.clear()
# Try accessing /dashboard
# Should redirect to /login
```

## Common Issues & Solutions

### Issue: "401 Unauthorized" on all requests
**Solution**: Make sure your backend API Gateway is running and forwarding the Authorization header.

### Issue: Token not being sent
**Check**:
```typescript
// In browser console
localStorage.getItem('carpoolToken')
// Should return the JWT token string
```

### Issue: User logged out immediately
**Check**: Token might be expired. Backend should return valid tokens with proper expiration time.

### Issue: CORS errors
**Solution**: Backend needs to allow `Authorization` header:
```java
// In your CORS config
.allowedHeaders("Authorization", "Content-Type", ...)
```

## Environment Variables

Make sure you have this in your `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

The API base URL should point to your API Gateway, not directly to microservices.

## Backend Requirements

Your backend must:
1. ✓ Auth service generates JWT tokens on login/signup
2. ✓ API Gateway validates JWT tokens
3. ✓ All protected endpoints require Authorization header
4. ✓ Return 401 for invalid/expired tokens
5. ✓ CORS configured to allow Authorization header

## Need Help?

Check these files:
- `JWT_MIGRATION_SUMMARY.md` - Detailed technical documentation
- `src/services/api.ts` - See how tokens are added to requests
- `src/contexts/AuthContext.tsx` - See how tokens are managed
- Browser DevTools → Network tab - See actual requests being made

## Quick Debug Commands

```typescript
// In browser console

// Check if token exists
localStorage.getItem('carpoolToken')

// Check token expiration
const token = localStorage.getItem('carpoolToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));

// Clear auth and test
localStorage.clear();
window.location.href = '/login';
```
