# Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FairGig Auth Service                       │
│                     (Node.js + Express + TS)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────────┐      ┌──────────────┐     ┌──────────────┐
    │   Routes   │      │ Middleware   │     │ Controllers  │
    │            │      │              │     │              │
    │ /api/auth  │◄─────┤ JWT Verify   │     │ signUp       │
    │ /api/users │      │ Role Auth    │     │ login        │
    └────────────┘      └──────────────┘     │ updateUser   │
        │                                     └──────────────┘
        │                                            │
        └────────────────────────┬───────────────────┘
                                 │
                                 ▼
                        ┌─────────────────────┐
                        │  Database Layer     │
                        │  (pg.Pool)          │
                        └─────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────────┐
                        │ PostgreSQL Database │
                        │  (users table)      │
                        └─────────────────────┘
```

## Request Flow: Login with Verifier Check

```
User sends login request
        │
        ▼
POST /api/auth/login {email, password}
        │
        ▼
auth.controller.login()
        ├─ Query database for user by email
        │
        ├─ Verify password with bcrypt
        │   └─ If invalid → Return 401
        │
        ├─ Check role
        │   └─ If WORKER → Proceed (approved by default)
        │   └─ If VERIFIER → Check is_approved_by_advocate
        │       ├─ If FALSE → Return 401 "Not approved"
        │       └─ If TRUE → Proceed
        │
        ├─ Generate JWT tokens
        │   ├─ Access Token (15 min) → Send in response
        │   └─ Refresh Token (7 day) → Set as HttpOnly cookie
        │
        └─ Return 200 with accessToken
                │
                ▼
        User receives token
```

## Verifier Approval Workflow (Critical)

```
┌─────────────────────────────────────────────────────────────────┐
│                  VERIFIER APPROVAL WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Verifier Signs Up
─────────────────────────
POST /api/auth/signup {email, password, role: VERIFIER}
                │
                ▼
        Create user in database
        ├─ id: UUID
        ├─ email: verifier@example.com
        ├─ password_hash: bcrypt(password)
        ├─ role: VERIFIER
        ├─ is_approved_by_advocate: FALSE  ◄─── KEY FIELD
        └─ created_at: now()

Result: Verifier account created but LOCKED


STEP 2: Verifier Tries to Login
─────────────────────────────────
POST /api/auth/login {email, password}
                │
                ▼
        Check: role == VERIFIER?
                │
        YES ────▼
            Check: is_approved_by_advocate == TRUE?
                │
        NO ─────▼
            BLOCKED! Return 401
            Message: "Account has not been approved by Advocate yet"

Result: Login fails, Verifier cannot access system


STEP 3: Advocate Approves Verifier
────────────────────────────────────
PATCH /api/users/verify/{verifierId}
        (with Advocate JWT token)
                │
                ▼
        Check: Caller role == ADVOCATE? 
                │
        YES ────▼
            Query user by verifierId
                │
                ▼
            Check: user.role == VERIFIER?
                │
        YES ────▼
            UPDATE users
            SET is_approved_by_advocate = TRUE
            WHERE id = verifierId
                │
                ▼
        Return 200 with updated user

Result: Verifier's is_approved_by_advocate = TRUE


STEP 4: Verifier Tries to Login Again
──────────────────────────────────────
POST /api/auth/login {email, password}
                │
                ▼
        Check: role == VERIFIER?
                │
        YES ────▼
            Check: is_approved_by_advocate == TRUE?
                │
        YES ────▼
            ✅ LOGIN SUCCEEDS!
            Return 200 with accessToken

Result: Verifier can now access the system
```

## JWT Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────┘

TOKENS CREATED AT LOGIN:
────────────────────────

Access Token:
  ├─ Payload: {id, email, role}
  ├─ Secret: JWT_SECRET (from .env)
  ├─ Expiration: 15 minutes
  └─ Location: Response body JSON

Refresh Token:
  ├─ Payload: {id, email, role}
  ├─ Secret: JWT_REFRESH_SECRET (from .env)
  ├─ Expiration: 7 days
  └─ Location: HttpOnly cookie (secure, encrypted)


REQUEST WITH TOKEN:
───────────────────

Header: Authorization: Bearer eyJhbGc...eyJpZC...

                │
                ▼
        authenticateJWT middleware:
        ├─ Extract token from header
        ├─ Verify signature with JWT_SECRET
        ├─ Check expiration
        ├─ Decode payload
        └─ Attach to req.user

                │
                ▼
        Route handler processes request
        with req.user available


REFRESH TOKEN FLOW:
───────────────────

POST /api/auth/refresh
(Cookie: refreshToken=eyJ...)
                │
                ▼
        Extract refreshToken from cookie
                │
                ▼
        Verify signature with JWT_REFRESH_SECRET
                │
                ├─ VALID ──────────────────────────┐
                │                                  │
                └─ EXPIRED ──────────────┐          │
                                        ▼          ▼
                                   Return 401   Query user by ID
                                                 (ensure user exists)
                                                      │
                                                      ▼
                                                Generate new
                                                access token
                                                      │
                                                      ▼
                                                Return 200
                                                with new token
```

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                 ROLE-BASED ACCESS MATRIX                         │
└─────────────────────────────────────────────────────────────────┘

Endpoint                          WORKER  VERIFIER  ADVOCATE
────────────────────────────────────────────────────────────────
POST /api/auth/signup               ✅      ✅        ✅
POST /api/auth/login                ✅      ✅*       ✅
POST /api/auth/refresh              ✅      ✅        ✅
POST /api/auth/logout               ✅      ✅        ✅

GET /api/users/me                   ✅      ✅        ✅
PUT /api/users/me                   ✅      ✅        ✅
DELETE /api/users/me                ✅      ✅        ✅

GET /api/users                      ❌      ❌        ✅
PATCH /api/users/verify/{id}        ❌      ❌        ✅

* VERIFIER login fails until is_approved_by_advocate = true
✅ = Can access
❌ = Cannot access
```

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                       USERS TABLE                             │
├──────────────────────────────────────────────────────────────┤
│ id (UUID) PRIMARY KEY                                        │
│ email (VARCHAR UNIQUE)                                       │
│ password_hash (VARCHAR)                                      │
│ role (VARCHAR CHECK: WORKER, VERIFIER, ADVOCATE)            │
│ is_approved_by_advocate (BOOLEAN DEFAULT FALSE)  ◄─ CRITICAL│
│ first_name (VARCHAR)                                         │
│ last_name (VARCHAR)                                          │
│ phone_number (VARCHAR)                                       │
│ profile_photo_url (TEXT)                                     │
│ created_at (TIMESTAMP)                                       │
│ updated_at (TIMESTAMP)  ◄─ Auto-updated by trigger          │
└──────────────────────────────────────────────────────────────┘

INDEXES:
  ├─ idx_users_email: email (for fast login lookup)
  └─ idx_users_role: role (for filtering by role)

TRIGGERS:
  └─ update_updated_at_column: Sets updated_at = NOW() on UPDATE
```

## Security Layer

```
┌──────────────────────────────────────────────────────────────┐
│                  SECURITY IMPLEMENTATIONS                     │
└──────────────────────────────────────────────────────────────┘

INPUT LEVEL:
  ├─ Parameterized SQL Queries: Prevent SQL injection
  │   └─ query('SELECT * FROM users WHERE email = $1', [email])
  │
  ├─ Request Validation: Check required fields
  │   └─ if (!email || !password) → 400 Bad Request
  │
  └─ Password Strength: Minimum checks
      └─ Hashed with bcrypt (10 rounds)

TRANSPORT LEVEL:
  ├─ HTTPS/TLS: Secure connection (production)
  │   └─ secure: NODE_ENV === 'production'
  │
  ├─ HttpOnly Cookies: Prevent XSS token theft
  │   └─ httpOnly: true
  │
  └─ CORS: Restrict cross-origin requests
      └─ cors() middleware

APPLICATION LEVEL:
  ├─ JWT Verification: Validate token signature & expiration
  │   └─ jwt.verify(token, JWT_SECRET)
  │
  ├─ Role Authorization: Check user permissions
  │   └─ authorizeRoles('ADVOCATE')
  │
  └─ Verifier Approval Check: Enforce approval workflow
      └─ if (role === 'VERIFIER' && !is_approved_by_advocate)

OUTPUT LEVEL:
  ├─ Error Message Sanitization: No sensitive info leaked
  │   └─ "Invalid email or password" (not "User not found")
  │
  └─ Response Filtering: Don't send password_hash
      └─ SELECT id, email, role, ... (exclude password_hash)
```

## Middleware Stack

```
Request
  │
  ▼
cors() ─────────────────────────────┐
                                    │
express.json() ────────────────────┤
                                    │
cookieParser() ─────────────────────┤
                                    ├─ Global Middleware
dotenv.config() ────────────────────┤
                                    │
swaggerUI ──────────────────────────┘
  │
  ▼
Router Selection:
  ├─ /api/auth ──────────────────────┐
  │                                  │
  ├─ /api/users ──────────────────────┤─ Route-specific Middleware
  │    ├─ authenticateJWT ────────────┤
  │    └─ authorizeRoles() (optional) │
  │                                  ├─ Handler
  └─ /api-docs ──────────────────────┘
  │
  ▼
Controller Function
  │
  ▼
Database Query
  │
  ▼
Response
```

## Deployment Architecture (Example: Railway)

```
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  GitHub Repository                                          │
│  (contains .env, .git, src/, dist/, package.json)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  Railway CI/CD Pipeline          │
        │  ├─ Detect Node.js project       │
        │  ├─ Run `pnpm install`           │
        │  ├─ Run `pnpm build`             │
        │  └─ Run `pnpm start`             │
        └─────────┬────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌──────────────────┐
│ Server │  │ Server │  │ PostgreSQL Cloud │
│ (Hot)  │  │(Active)│  │ (Managed DB)     │
└────────┘  └────────┘  └──────────────────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
                  ▼
            ┌──────────┐
            │ Load     │
            │ Balancer │
            └────┬─────┘
                 │
                 ▼
            Users (HTTPS)
```

## Data Flow: Sign Up → Login → Protected Request

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETE USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: REGISTRATION
──────────────────────
User Input:
  email: "worker@fairgig.com"
  password: "MyPassword123!"
  role: "WORKER"
              │
              ▼
      POST /api/auth/signup
              │
              ▼
      auth.controller.signUp()
        ├─ Validate input
        ├─ Check email not exists
        ├─ Hash password: bcrypt.hash()
        ├─ Insert to DB:
        │   INSERT INTO users (email, password_hash, role, is_approved_by_advocate)
        │   VALUES ($1, $2, $3, true)
        └─ Generate tokens
              │
              ▼
      Response:
        {
          "accessToken": "eyJhbGc...",
          "user": { "id", "email", "role" }
        }
        + Cookie: refreshToken (HttpOnly)


PHASE 2: LOGIN
──────────────
User Input:
  email: "worker@fairgig.com"
  password: "MyPassword123!"
              │
              ▼
      POST /api/auth/login
              │
              ▼
      auth.controller.login()
        ├─ Query: SELECT * FROM users WHERE email = $1
        ├─ Verify password: bcrypt.compare()
        ├─ Check role and is_approved_by_advocate
        ├─ Generate tokens
        └─ Response with accessToken + refreshToken cookie


PHASE 3: PROTECTED REQUEST
──────────────────────────
User sends:
  GET /api/users/me
  Header: Authorization: Bearer eyJhbGc...
              │
              ▼
      authenticateJWT middleware:
        ├─ Extract "eyJhbGc..." from header
        ├─ Verify: jwt.verify(token, JWT_SECRET)
        ├─ Attach payload to req.user
        └─ Continue to handler
              │
              ▼
      user.controller.getUserProfile()
        ├─ Use req.user.id
        ├─ Query: SELECT * FROM users WHERE id = $1
        └─ Return user profile
              │
              ▼
      Response:
        {
          "id": "550e84...",
          "email": "worker@fairgig.com",
          "role": "WORKER",
          ...
        }


PHASE 4: TOKEN REFRESH
──────────────────────
(When access token nears expiration)

User sends:
  POST /api/auth/refresh
  (Cookie: refreshToken=eyJ...)
              │
              ▼
      auth.controller.refreshToken()
        ├─ Extract refreshToken from cookie
        ├─ Verify: jwt.verify(token, JWT_REFRESH_SECRET)
        ├─ Query user to ensure still exists
        ├─ Generate new accessToken
        └─ Return new accessToken
              │
              ▼
      User stores new accessToken
      (cycle repeats)
```

---

This architecture ensures:
- ✅ Secure authentication with JWT
- ✅ Verifier approval workflow enforcement
- ✅ Role-based access control
- ✅ Data integrity with parameterized queries
- ✅ Clear separation of concerns (routes → controllers → db)
- ✅ Comprehensive error handling
- ✅ Production-ready deployment
