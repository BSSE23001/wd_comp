# API Endpoints Reference

## Authentication Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user (WORKER or VERIFIER)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "WORKER",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "WORKER",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate and receive access token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "WORKER"
    }
  }
}
```

**Response (401 Unauthorized - Verifier Not Approved):**
```json
{
  "success": false,
  "message": "Your account has not been approved by the Advocate yet. Please wait for approval."
}
```

**Cookies Set:**
- `refreshToken`: HttpOnly cookie with 7-day expiration

---

### 3. Refresh Token
**Endpoint:** `POST /api/auth/refresh`

**Description:** Get new access token using refresh token cookie

**Request:** No body required (uses refreshToken cookie)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

### 4. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Clear refresh token cookie

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## User Endpoints (Protected)

All user endpoints require `Authorization: Bearer {accessToken}` header

### 5. Get Current User Profile
**Endpoint:** `GET /api/users/me`

**Headers Required:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "WORKER",
    "is_approved_by_advocate": true,
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1-555-0123",
    "profile_photo_url": "https://example.com/photos/john.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 6. Update User Profile
**Endpoint:** `PUT /api/users/me`

**Headers Required:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1-555-9876",
  "profile_photo_url": "https://example.com/photos/jane.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone_number": "+1-555-9876",
    "profile_photo_url": "https://example.com/photos/jane.jpg",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

---

### 7. Delete User Account
**Endpoint:** `DELETE /api/users/me`

**Headers Required:**
```
Authorization: Bearer eyJhbGc...
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

⚠️ **Warning:** This action is permanent and cannot be undone.

---

### 8. Get All Users (Advocate Only)
**Endpoint:** `GET /api/users`

**Headers Required:**
```
Authorization: Bearer {advocateAccessToken}
```

**Query Parameters (optional):**
- `role`: Filter by role (WORKER, VERIFIER, or ADVOCATE)

**Example:** `GET /api/users?role=VERIFIER`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "verifier@example.com",
      "role": "VERIFIER",
      "is_approved_by_advocate": false,
      "first_name": "Jane",
      "last_name": "Smith",
      "phone_number": "+1-555-0123",
      "profile_photo_url": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**Response (403 Forbidden - Not Advocate):**
```json
{
  "success": false,
  "message": "Only Advocate can view all users"
}
```

---

### 9. Approve a Verifier (Advocate Only)
**Endpoint:** `PATCH /api/users/verify/{verifierId}`

**Headers Required:**
```
Authorization: Bearer {advocateAccessToken}
```

**Path Parameter:**
- `verifierId`: UUID of the Verifier to approve

**Example:** `PATCH /api/users/verify/550e8400-e29b-41d4-a716-446655440000`

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verifier approved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "verifier@example.com",
    "role": "VERIFIER",
    "is_approved_by_advocate": true,
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only Advocate can approve Verifiers"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Error Responses

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth failed) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Optional technical details"
}
```

---

## Authentication Flow

### For Workers & Advocates
1. `POST /api/auth/signup` → Can login immediately
2. `POST /api/auth/login` → Receive access token
3. Use access token in `Authorization: Bearer` header
4. When token expires, use `POST /api/auth/refresh`

### For Verifiers (Special Flow)
1. `POST /api/auth/signup` → Registered but cannot login
2. Advocate must call `PATCH /api/users/verify/{verifierId}`
3. After approval, Verifier can `POST /api/auth/login`
4. Same token refresh flow as others

---

## Token Details

### Access Token
- **Duration**: 15 minutes
- **Location**: Response body in auth endpoints
- **Usage**: `Authorization: Bearer {accessToken}`

### Refresh Token
- **Duration**: 7 days
- **Location**: HttpOnly cookie
- **Usage**: Automatically sent with requests to `/api/auth/refresh`

---

## CURL Examples

### Sign Up as Worker
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "Test123!",
    "role": "WORKER"
  }' \
  -i
```

### Login and Save Cookies
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "Test123!"
  }' \
  -c cookies.txt \
  -i
```

### Get Profile with Token
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -i
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt \
  -i
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider implementing:
- IP-based rate limiting on `/api/auth/login`
- Token-based rate limiting on protected endpoints

---

## Pagination

List endpoints (like `GET /api/users`) currently return all results. For production with many users, implement pagination using query parameters like `?page=1&limit=20`.

---

## Webhook Events (Not Implemented)

Future enhancement ideas:
- User signup event
- Verifier approval event
- Account deletion event

Connect your frontend to these events for real-time updates.
