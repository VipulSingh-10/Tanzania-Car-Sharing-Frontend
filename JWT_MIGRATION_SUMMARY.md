# JWT Authentication Migration Summary

## Overview
The frontend has been updated to work with the new JWT-based authentication system using Spring Security in the backend.

## Key Changes

### 1. **Updated DTOs** (`src/types/api.ts`)
- **LoginResponseDTO**: Now returns `{ token: string, emailId: string }` instead of `{ loginSuccess, userId, errMsg }`
- **SignUpResponseDTO**: Now returns `{ token: string, emailId: string }` instead of `{ signUpSuccess, userId, username }`
- **UserInfoDTO**: Cleaned up to match backend structure (removed userCars array, fixed dob type)

### 2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Added `token` state to store JWT token
- Updated `login()` function signature: `login(token: string, emailId: string, userInfo: UserInfoDTO)`
- Token is now stored in localStorage as `carpoolToken`
- `isAuthenticated` now checks for both token and userId
- All auth data (token, userId, userInfo) cleared on logout

### 3. **API Service** (`src/services/api.ts`)
- Added `getAuthToken()` method to retrieve token from localStorage
- Updated `makeRequest()` to accept `requiresAuth` parameter
- **JWT token automatically added** to `Authorization: Bearer <token>` header for authenticated requests
- Added automatic 401/403 error handling (clears auth data and redirects to login)
- Updated endpoint paths to match backend routes:
  - `/api/auth/login` - Login endpoint (no auth required)
  - `/api/auth/signup` - Signup endpoint (no auth required)
  - `/api/users/*` - User endpoints (auth required)
  - `/api/rides/*` - Ride endpoints (auth required)
  - `/api/myrides/*` - My rides endpoints (auth required)
  - `/api/vehicles/*` - Vehicle endpoints (auth required)

### 4. **Login Page** (`src/pages/Login.tsx`)
- Updated to handle new response structure with JWT token
- After successful login:
  1. Receives JWT token and emailId from auth-service
  2. Fetches user profile using the token
  3. Stores token, emailId, and user info in context/localStorage
  4. Redirects to dashboard

### 5. **Signup Page** (`src/pages/Signup.tsx`)
- Updated to handle new response structure with JWT token
- After successful signup:
  1. Receives JWT token and emailId from auth-service
  2. Fetches user profile using the token
  3. **Automatically logs user in** (no need to redirect to login)
  4. Redirects to dashboard

### 6. **Protected Route** (`src/components/ProtectedRoute.tsx`)
- Added token expiration check
- Validates token before rendering protected content
- Automatically logs out and redirects if token is expired

### 7. **Auth Utilities** (`src/lib/auth-utils.ts`) - NEW FILE
- `clearAuthData()`: Clears all auth data from localStorage
- `getStoredToken()`: Retrieves stored JWT token
- `isTokenExpired()`: Checks if JWT token is expired by decoding payload
- `handleAuthError()`: Handles authentication errors

## Authentication Flow

### Login Flow
```
1. User enters credentials → POST /api/auth/login
2. Backend returns { token, emailId }
3. Frontend stores token in localStorage
4. Frontend calls GET /api/users/{emailId} with Authorization header
5. Backend validates JWT token
6. Frontend stores user info and redirects to dashboard
```

### Signup Flow
```
1. User submits signup form → POST /api/auth/signup
2. Backend creates user and returns { token, emailId }
3. Frontend stores token in localStorage
4. Frontend calls GET /api/users/{emailId} with Authorization header
5. Backend validates JWT token
6. Frontend stores user info and redirects to dashboard (auto-login)
```

### Authenticated Requests Flow
```
1. Frontend retrieves token from localStorage
2. Adds "Authorization: Bearer <token>" header to request
3. Backend (API Gateway + Auth Service) validates JWT token
4. If valid: processes request
5. If invalid/expired: returns 401
6. Frontend catches 401, clears auth data, redirects to login
```

## Backend Integration Points

### Auth Service Endpoints (Spring Security)
- `POST /api/auth/login` - Validates credentials, returns JWT token
- `POST /api/auth/signup` - Creates user, returns JWT token
- `POST /api/auth/validate` - Validates JWT token (used by API Gateway)

### API Gateway
- Intercepts all requests (except auth endpoints)
- Extracts JWT token from Authorization header
- Validates token with auth-service
- Forwards request to appropriate microservice if valid
- Returns 401 if token is invalid/missing

### Protected Microservices
- User Service: `/api/users/*`
- Ride Service: `/api/rides/*`, `/api/myrides/*`
- Vehicle Service: `/api/vehicles/*`

All these endpoints now require valid JWT token in Authorization header.

## Storage
- **Token**: `localStorage.getItem('carpoolToken')`
- **User ID**: `localStorage.getItem('carpoolUserId')` (stores emailId)
- **User Info**: `localStorage.getItem('carpoolUser')` (JSON string)

## Security Notes
1. JWT token is stored in localStorage (consider httpOnly cookies for production)
2. Token expiration is checked on protected route access
3. Automatic logout on 401/403 responses
4. Token is sent in Authorization header (not in URL)
5. Sensitive endpoints require authentication

## Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Signup with new user
- [ ] Access protected routes after login
- [ ] Access protected routes without login (should redirect)
- [ ] API calls include Authorization header
- [ ] Automatic logout on token expiration
- [ ] Automatic logout on 401 errors
- [ ] Token persists across page refreshes
- [ ] Logout clears all auth data

## Next Steps (Optional Improvements)
1. Add refresh token mechanism
2. Implement token refresh before expiration
3. Add "Remember Me" functionality
4. Consider httpOnly cookies instead of localStorage
5. Add loading states during token validation
6. Implement better error messages for specific auth failures
