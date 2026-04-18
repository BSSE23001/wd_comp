# FairGig Auth Service - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd api/auth-service
pnpm install
```

### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit with your values:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# - JWT_REFRESH_SECRET: Generate another random secret
# - ADVOCATE_EMAIL: Email for the single Advocate account
# - ADVOCATE_PASSWORD: Password for the Advocate
```

### 3. Run Development Server
```bash
pnpm dev
```

The server will:
- Test database connection
- Create tables if they don't exist
- Start on http://localhost:5000
- Swagger UI at http://localhost:5000/api-docs

## Key Concepts

### Roles
- **WORKER**: Gig worker - can login immediately after signup
- **VERIFIER**: Verifies gig work - needs Advocate approval before login
- **ADVOCATE**: System admin (only 1) - manages all users and approves Verifiers

### Critical Verifier Flow
1. Verifier signs up → stored in DB with `is_approved_by_advocate = false`
2. Verifier tries to login → **DENIED** with message about needing approval
3. Advocate approves Verifier → `is_approved_by_advocate = true`
4. Verifier can now login

## API Overview

### Public Endpoints (No Auth Required)
```
POST /api/auth/signup         - Register new user
POST /api/auth/login          - Login and get tokens
POST /api/auth/refresh        - Refresh access token
POST /api/auth/logout         - Logout
```

### Protected Endpoints (JWT Required)
```
GET  /api/users/me            - Get your profile
PUT  /api/users/me            - Update your profile
DELETE /api/users/me          - Delete your account

GET  /api/users               - List all users (ADVOCATE only)
PATCH /api/users/verify/{id}  - Approve a Verifier (ADVOCATE only)
```

## Testing with cURL

### 1. Register a Worker
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "Test123!",
    "role": "WORKER",
    "first_name": "John"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "Test123!"
  }' \
  -c cookies.txt  # Save cookies
```

### 3. Get Your Profile
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer {accessToken}"
```

### 4. Register as Advocate
```bash
# Use the email from ADVOCATE_EMAIL in .env
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "advocate@fairgig.com",
    "password": "SecurePassword123!",
    "role": "ADVOCATE"
  }'
```

### 5. Register a Verifier
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verifier@fairgig.com",
    "password": "Test123!",
    "role": "VERIFIER"
  }'
```

### 6. Try to Login as Verifier (Will Fail)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verifier@fairgig.com",
    "password": "Test123!"
  }'
# Returns: "Your account has not been approved by the Advocate yet"
```

### 7. Advocate Approves Verifier
```bash
curl -X PATCH http://localhost:5000/api/users/verify/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {advocateToken}"
```

### 8. Verifier Can Now Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verifier@fairgig.com",
    "password": "Test123!"
  }'
# Now succeeds!
```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('WORKER', 'VERIFIER', 'ADVOCATE')),
  is_approved_by_advocate BOOLEAN DEFAULT FALSE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_photo_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": { /* response data */ }
}
```

## Security Features

✅ Parameterized SQL queries (prevent injection)
✅ Password hashing with bcrypt
✅ JWT with expiration (15 min access, 7 day refresh)
✅ HttpOnly cookies for refresh tokens
✅ Role-based access control
✅ CORS enabled
✅ Error messages don't leak sensitive info

## Building for Production

```bash
pnpm build          # Compile TypeScript
pnpm start          # Run compiled version
```

Set `NODE_ENV=production` before running to enable secure cookies.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check DATABASE_URL in .env |
| "Invalid token" | Access token expired? Use `/api/auth/refresh` |
| "Verifier can't login" | Advocate needs to approve via `/api/users/verify/{id}` |
| "Port already in use" | Change PORT in .env |
| "Module not found: bcrypt" | Run `pnpm install` again |

## Files Overview

| File | Purpose |
|------|---------|
| `src/index.ts` | Express app setup + Swagger config |
| `src/db/index.ts` | Database connection pool |
| `src/db/init.sql` | Database schema |
| `src/types/index.ts` | TypeScript interfaces |
| `src/middlewares/auth.middleware.ts` | JWT verification + role auth |
| `src/controllers/auth.controller.ts` | signup, login, refresh logic |
| `src/controllers/user.controller.ts` | CRUD + verifier approval |
| `src/routes/auth.routes.ts` | Public auth routes |
| `src/routes/user.routes.ts` | Protected user routes |

## Environment Variables

```env
NODE_ENV              # development or production
PORT                  # Server port (default: 5000)
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Secret for access tokens
JWT_REFRESH_SECRET    # Secret for refresh tokens
ADVOCATE_EMAIL        # Email for the single Advocate
ADVOCATE_PASSWORD     # Password for the Advocate
```

## Next Steps

1. Set up your PostgreSQL database
2. Configure .env with your credentials
3. Run `pnpm dev` to start server
4. Visit http://localhost:5000/api-docs to test endpoints
5. Implement frontend authentication with the /api/auth/signup and /api/auth/login endpoints
6. Have your frontend store access token in memory and refresh token in secure cookie
7. Include Authorization header with every protected request

Happy coding! 🚀
