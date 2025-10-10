# JWT Authentication Flow Diagram

## System Architecture

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP Requests
       ▼
┌─────────────────┐
│  API Gateway    │
│  (Port 8080)    │
└────┬───────┬────┘
     │       │
     │       ├─────────────┐
     │       │             │
     ▼       ▼             ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│  Auth   │ │   User   │ │   Ride   │
│ Service │ │ Service  │ │ Service  │
└─────────┘ └──────────┘ └──────────┘
```

## Login Flow (Sequence Diagram)

```
┌────────┐           ┌──────────┐           ┌─────────┐           ┌──────────┐
│Browser │           │   API    │           │  Auth   │           │   User   │
│        │           │ Gateway  │           │ Service │           │ Service  │
└───┬────┘           └────┬─────┘           └────┬────┘           └────┬─────┘
    │                     │                      │                     │
    │ 1. POST /api/auth/login                    │                     │
    │     {emailId, password}                    │                     │
    ├──────────────────────┼─────────────────────>                     │
    │                     │                      │                     │
    │                     │  2. Validate         │                     │
    │                     │     credentials       │                     │
    │                     │     Generate JWT     │                     │
    │                     <──────────────────────┤                     │
    │                     │                      │                     │
    │ 3. Response: {token, emailId}              │                     │
    <─────────────────────┼──────────────────────┤                     │
    │                     │                      │                     │
    │ 4. Store token      │                      │                     │
    │    localStorage     │                      │                     │
    ├─────────────────────x                      │                     │
    │                     │                      │                     │
    │ 5. GET /api/users/{emailId}                │                     │
    │    Authorization: Bearer <token>           │                     │
    ├──────────────────────┼──────────────────────┼─────────────────────>
    │                     │                      │                     │
    │                     │  6. Validate token   │                     │
    │                     ├─────────────────────>                     │
    │                     │                      │                     │
    │                     │  7. Token valid      │                     │
    │                     <──────────────────────┤                     │
    │                     │                      │                     │
    │                     │  8. Forward request  │                     │
    │                     │ (with token verified)                      │
    │                     ├─────────────────────────────────────────────>
    │                     │                      │                     │
    │                     │  9. User profile     │                     │
    │                     <──────────────────────────────────────────────┤
    │                     │                      │                     │
    │ 10. Response: UserInfoDTO                  │                     │
    <─────────────────────┼──────────────────────┼─────────────────────┤
    │                     │                      │                     │
    │ 11. Store user info │                      │                     │
    │     Navigate to     │                      │                     │
    │     dashboard       │                      │                     │
    ├─────────────────────x                      │                     │
    │                     │                      │                     │
```

## Signup Flow

```
┌────────┐           ┌──────────┐           ┌─────────┐           ┌──────────┐
│Browser │           │   API    │           │  Auth   │           │   User   │
│        │           │ Gateway  │           │ Service │           │ Service  │
└───┬────┘           └────┬─────┘           └────┬────┘           └────┬─────┘
    │                     │                      │                     │
    │ 1. POST /api/auth/signup                   │                     │
    │     {fullName, emailId, password, ...}     │                     │
    ├──────────────────────┼─────────────────────>                     │
    │                     │                      │                     │
    │                     │  2. Create user      │                     │
    │                     │     in auth DB       │                     │
    │                     │     Generate JWT     │                     │
    │                     │                      │                     │
    │                     │  3. Call user-service                      │
    │                     │     to create profile│                     │
    │                     │                      ├─────────────────────>
    │                     │                      │                     │
    │                     │  4. Profile created  │                     │
    │                     │                      <──────────────────────┤
    │                     │                      │                     │
    │ 5. Response: {token, emailId}              │                     │
    <─────────────────────┼──────────────────────┤                     │
    │                     │                      │                     │
    │ 6. Store token      │                      │                     │
    │    localStorage     │                      │                     │
    ├─────────────────────x                      │                     │
    │                     │                      │                     │
    │ 7-11. Same as login flow (fetch user info) │                     │
    │                     │                      │                     │
```

## Authenticated Request Flow

```
┌────────┐           ┌──────────┐           ┌─────────┐           ┌──────────┐
│Browser │           │   API    │           │  Auth   │           │   Ride   │
│        │           │ Gateway  │           │ Service │           │ Service  │
└───┬────┘           └────┬─────┘           └────┬────┘           └────┬─────┘
    │                     │                      │                     │
    │ 1. POST /api/rides/find-ride               │                     │
    │    Authorization: Bearer <token>           │                     │
    ├──────────────────────>                     │                     │
    │                     │                      │                     │
    │                     │  2. Validate token   │                     │
    │                     ├─────────────────────>                     │
    │                     │                      │                     │
    │                     │  3. Token valid      │                     │
    │                     │     + emailId        │                     │
    │                     <──────────────────────┤                     │
    │                     │                      │                     │
    │                     │  4. Forward request  │                     │
    │                     │     (token verified) │                     │
    │                     ├─────────────────────────────────────────────>
    │                     │                      │                     │
    │                     │  5. Available rides  │                     │
    │                     <──────────────────────────────────────────────┤
    │                     │                      │                     │
    │ 6. Response: rides  │                      │                     │
    <─────────────────────┤                      │                     │
    │                     │                      │                     │
```

## Token Expiration / Invalid Token Flow

```
┌────────┐           ┌──────────┐           ┌─────────┐
│Browser │           │   API    │           │  Auth   │
│        │           │ Gateway  │           │ Service │
└───┬────┘           └────┬─────┘           └────┬────┘
    │                     │                      │
    │ 1. Any authenticated request               │
    │    Authorization: Bearer <expired-token>   │
    ├──────────────────────>                     │
    │                     │                      │
    │                     │  2. Validate token   │
    │                     ├─────────────────────>
    │                     │                      │
    │                     │  3. Token invalid    │
    │                     │     (expired)        │
    │                     <──────────────────────┤
    │                     │                      │
    │ 4. 401 Unauthorized │                      │
    <─────────────────────┤                      │
    │                     │                      │
    │ 5. Clear localStorage                      │
    │    Redirect to /login                      │
    ├─────────────────────x                      │
    │                     │                      │
```

## Data Flow

### LocalStorage Structure
```javascript
{
  "carpoolToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "carpoolUserId": "user@example.com",
  "carpoolUser": "{\"fullName\":\"John Doe\",\"emailId\":\"user@example.com\",...}"
}
```

### JWT Token Structure
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user@example.com",
  "exp": 1234567890,
  "iat": 1234564290
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

### Request Headers (Authenticated)
```
POST /api/rides/find-ride HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "userId": "user@example.com",
  "requestContent": {
    "pickupPoint": {...},
    "destinationPoint": {...},
    ...
  }
}
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            AuthContext (State)                  │   │
│  │  - token: string | null                         │   │
│  │  - userId: string | null                        │   │
│  │  - userInfo: UserInfoDTO | null                 │   │
│  │  - isAuthenticated: boolean                     │   │
│  │                                                  │   │
│  │  Methods:                                        │   │
│  │  - login(token, emailId, userInfo)              │   │
│  │  - logout()                                      │   │
│  └─────────────┬───────────────────────────────────┘   │
│                │                                        │
│                ├─────────────┬─────────────┬───────────┤
│                ▼             ▼             ▼           │
│         ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│         │  Login   │  │  Signup  │  │Protected │      │
│         │   Page   │  │   Page   │  │  Routes  │      │
│         └─────┬────┘  └─────┬────┘  └─────┬────┘      │
│               │             │             │            │
│               └─────────────┴─────────────┘            │
│                             │                          │
│                             ▼                          │
│                  ┌────────────────────┐                │
│                  │   API Service      │                │
│                  │                    │                │
│                  │  - getAuthToken()  │                │
│                  │  - makeRequest()   │                │
│                  │    + adds Bearer   │                │
│                  │      token         │                │
│                  └────────┬───────────┘                │
│                           │                            │
└───────────────────────────┼────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Backend     │
                    │  API Gateway  │
                    └───────────────┘
```

## State Transitions

```
┌────────────┐
│ No Token   │  (Initial state or after logout)
└─────┬──────┘
      │
      │ User logs in / signs up
      │ Token received
      ▼
┌────────────┐
│ Has Token  │  (Authenticated state)
└─────┬──────┘
      │
      ├─────────> Token expires
      ├─────────> 401 error
      ├─────────> User logs out
      │
      ▼
┌────────────┐
│ No Token   │  (Back to initial state)
└────────────┘
```
