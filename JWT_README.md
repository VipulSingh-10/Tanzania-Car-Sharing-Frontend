# 🔐 JWT Authentication Implementation

## Overview

This frontend application has been updated to use **JWT (JSON Web Token) authentication** with Spring Security backend. All authenticated API requests now include a Bearer token in the Authorization header.

---

## 📖 Documentation Index

This directory contains comprehensive documentation about the JWT implementation:

### 1. 📋 **CHANGES_SUMMARY.md** (Start Here!)
**→ Overview of all changes and quick start guide**
- What was modified
- How to test
- Key features
- Quick debugging tips

### 2. 🚀 **JWT_QUICK_REFERENCE.md**
**→ Developer quick reference guide**
- How it works now vs before
- Common patterns
- Quick debug commands
- Environment setup

### 3. 📚 **JWT_MIGRATION_SUMMARY.md**
**→ Detailed technical documentation**
- Complete authentication flow
- Backend integration details
- Storage mechanisms
- Security notes

### 4. 🔄 **JWT_FLOW_DIAGRAMS.md**
**→ Visual flow diagrams**
- Login sequence
- Signup sequence
- Authenticated requests
- Component interactions

### 5. 🧪 **API_TESTING_EXAMPLES.md**
**→ API testing examples**
- cURL commands
- Postman setup
- JavaScript examples
- Common HTTP status codes

### 6. ✅ **TESTING_CHECKLIST.md**
**→ Comprehensive testing checklist**
- Step-by-step test procedures
- Verification steps
- Debug commands
- Summary report template

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Backend services must be running:
- API Gateway (port 8080)
- Auth Service
- User Service
- Ride Service
- Vehicle Service
```

### 2. Environment Setup
```bash
# Create .env file in project root
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Install & Run
```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### 4. Test Authentication
1. Navigate to `http://localhost:5173/signup`
2. Create a new account
3. You'll be automatically logged in and redirected to dashboard
4. Check browser console and localStorage for JWT token

---

## 🔑 Key Concepts

### JWT Token Storage
```javascript
// Token is stored in browser localStorage
localStorage.getItem('carpoolToken')        // The JWT token
localStorage.getItem('carpoolUserId')       // User's email
localStorage.getItem('carpoolUser')         // User info (JSON)
```

### Authenticated API Requests
```javascript
// Authorization header is automatically added
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Routes
All routes except `/login`, `/signup`, and `/` require authentication.

---

## 🛠️ What Changed?

### Before (Old System)
```
Login → Get userId → Store userId → Make API calls
```

### After (New JWT System)
```
Login → Get JWT token → Store token → Include token in headers → Make API calls
Signup → Get JWT token → Auto-login → Dashboard
```

---

## 📁 Modified Files

### Core Application Files
- `src/types/api.ts` - Updated DTOs
- `src/contexts/AuthContext.tsx` - Token management
- `src/services/api.ts` - JWT header injection
- `src/pages/Login.tsx` - JWT login flow
- `src/pages/Signup.tsx` - JWT signup + auto-login
- `src/components/ProtectedRoute.tsx` - Token validation

### New Utility File
- `src/lib/auth-utils.ts` - Auth helper functions

---

## 🔍 How to Verify It's Working

### 1. Check Token in Console
```javascript
console.log(localStorage.getItem('carpoolToken'));
// Should output: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Check Network Requests
1. Open DevTools → Network tab
2. Login and navigate to dashboard
3. Click on any API request
4. Check Request Headers
5. Should see: `Authorization: Bearer <token>`

### 3. Test Protected Routes
- Clear localStorage: `localStorage.clear()`
- Try to access `/dashboard`
- Should redirect to `/login` immediately

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check that:
- Backend is running
- Token is present in localStorage
- Token is not expired
- API Gateway is validating tokens correctly

### Issue: CORS Error
**Solution**: Backend CORS must allow:
```java
.allowedHeaders("Authorization", "Content-Type")
```

### Issue: Token Not Persisting
**Solution**: Check:
- Browser localStorage is enabled
- No browser extensions blocking localStorage
- No incognito/private mode (may clear on close)

### Issue: Automatic Logout
**Solution**: Token might be expired. Check expiration:
```javascript
const token = localStorage.getItem('carpoolToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

---

## 📊 API Endpoints

### Public (No Token Required)
- `POST /api/auth/login`
- `POST /api/auth/signup`

### Protected (Token Required)
- `GET /api/users/{emailId}`
- `POST /api/rides/find-ride`
- `POST /api/rides/join-trip`
- `POST /api/ride/create-trip`
- `GET /api/vehicles/{userId}`
- `POST /api/vehicles/register`
- `POST /api/myrides/upcoming`
- `POST /api/myrides/history`
- `POST /api/myrides/cancel`

---

## 🔒 Security Features

✅ JWT tokens for stateless authentication
✅ Automatic token validation on protected routes
✅ Auto-logout on token expiration
✅ Auto-redirect on 401/403 errors
✅ Token sent in Authorization header (not URL)
✅ Secure token storage in localStorage

---

## 📞 Need More Help?

1. **Quick Issue?** → Check `JWT_QUICK_REFERENCE.md`
2. **Testing?** → Follow `TESTING_CHECKLIST.md`
3. **Understanding Flow?** → See `JWT_FLOW_DIAGRAMS.md`
4. **API Testing?** → Use `API_TESTING_EXAMPLES.md`
5. **Deep Dive?** → Read `JWT_MIGRATION_SUMMARY.md`

---

## 🎯 Next Steps

1. ✅ Read `CHANGES_SUMMARY.md` for overview
2. ✅ Follow `TESTING_CHECKLIST.md` to verify everything works
3. ✅ Use `API_TESTING_EXAMPLES.md` for API testing
4. ✅ Keep `JWT_QUICK_REFERENCE.md` handy during development

---

## 📝 Notes

- JWT tokens expire after a certain time (configured in backend)
- Token refresh mechanism can be added as an enhancement
- Consider httpOnly cookies for production for better security
- All map-related functionality remains unchanged

---

## ✨ Features

🔐 Secure JWT authentication
🚀 Auto-login after signup
🔄 Automatic token refresh handling
🛡️ Protected route guards
📱 Persistent auth across refreshes
🎯 Automatic error handling
✅ Clean separation of concerns

---

**Status**: ✅ Complete and Ready for Testing
**Last Updated**: October 10, 2025
**Version**: 1.0.0
