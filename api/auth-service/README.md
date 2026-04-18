# FairGig Authentication & User Management Service

A complete, production-ready authentication and user management microservice for the FairGig platform. Built with Express.js, PostgreSQL (via raw SQL queries with pg), JWT authentication, and comprehensive Swagger/OpenAPI documentation.

## Features

✅ **Role-Based Access Control**
- WORKER: Standard gig worker users
- VERIFIER: Users who verify gig work (requires Advocate approval before login)
- ADVOCATE: Single system administrator with full control

✅ **Secure Authentication**
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Refresh tokens stored in secure, HttpOnly cookies
- Parameterized SQL queries to prevent injection attacks

✅ **Verifier Approval Workflow**
- Verifiers can register but cannot login until approved by Advocate
- Advocate-only endpoint to approve Verifier accounts
- Clear separation of signup and login flows

✅ **User Management**
- CRUD operations on user profiles
- Advocate-only access to view all users with role filtering
- Profile information: name, phone, photo URL

✅ **API Documentation**
- Full Swagger/OpenAPI documentation with JSDoc comments
- Interactive API testing via Swagger UI
- Security scheme for Bearer authentication

## Project Structure

```
src/
├── db/
│   ├── index.ts          # Database connection pool setup
│   └── init.sql          # Database schema initialization
├── types/
│   └── index.ts          # TypeScript interfaces and types
├── middlewares/
│   └── auth.middleware.ts # JWT authentication & role authorization
├── controllers/
│   ├── auth.controller.ts # Authentication logic (signup, login, refresh)
│   └── user.controller.ts # User CRUD & Verifier approval
├── routes/
│   ├── auth.routes.ts    # Public auth endpoints with Swagger docs
│   └── user.routes.ts    # Protected user endpoints with Swagger docs
└── index.ts              # Express app setup with Swagger configuration
```

## Environment Variables

Create a `.env` file in the auth-service directory with the following variables:

```env
# Node Environment
NODE_ENV="development"  # or "production"
PORT="5000"

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT Configuration (generate secure random strings)
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_change_this_in_production"

# Advocate (System Admin) Credentials
ADVOCATE_EMAIL="advocate@fairgig.com"
ADVOCATE_PASSWORD="SecureAdvocatePassword123!"
```

### Generate Secure JWT Secrets

```bash
# Generate a 32-character secret
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Getting Started

### 1. Install Dependencies

```bash
cd api/auth-service
pnpm install
```

### 2. Configure Environment Variables

Update the `.env` file with your database connection string and JWT secrets:

```bash
# Copy example if available
cp .env.example .env

# Edit with your actual values
nano .env
```

### 3. Run Development Server

```bash
pnpm dev
```

The server will:
- ✅ Test the database connection
- ✅ Initialize the schema (create tables if they don't exist)
- ✅ Start on http://localhost:5000

### 4. Access API Documentation

Visit: **http://localhost:5000/api-docs**

You can test all endpoints directly from the Swagger UI!

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user (WORKER or VERIFIER) |
| POST | `/api/auth/login` | Login and receive access token |
| POST | `/api/auth/refresh` | Refresh access token using refresh cookie |
| POST | `/api/auth/logout` | Logout and clear refresh token |

### Users (Protected - Requires JWT)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user profile | All |
| PUT | `/api/users/me` | Update user profile | All |
| DELETE | `/api/users/me` | Delete user account | All |
| GET | `/api/users` | Get all users | ADVOCATE only |
| PATCH | `/api/users/verify/{verifierId}` | Approve a Verifier | ADVOCATE only |

## Usage Examples

### 1. Register a Worker

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "SecurePassword123!",
    "role": "WORKER",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "worker@fairgig.com",
      "role": "WORKER",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### 2. Register a Verifier (Requires Advocate Approval)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verifier@fairgig.com",
    "password": "SecurePassword123!",
    "role": "VERIFIER",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

⚠️ **Note**: Verifier can signup but **cannot login** until approved by Advocate.

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@fairgig.com",
    "password": "SecurePassword123!"
  }'
```

### 4. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer {accessToken}"
```

### 5. Advocate: View All Verifiers

```bash
curl -X GET "http://localhost:5000/api/users?role=VERIFIER" \
  -H "Authorization: Bearer {advocateAccessToken}"
```

### 6. Advocate: Approve a Verifier

```bash
curl -X PATCH http://localhost:5000/api/users/verify/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {advocateAccessToken}"
```

After approval, the Verifier can login successfully.

### 7. Refresh Access Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken={refreshToken}"
```

## Database Schema

The `init.sql` file creates a `users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('WORKER', 'VERIFIER', 'ADVOCATE')),
  is_approved_by_advocate BOOLEAN DEFAULT FALSE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `is_approved_by_advocate`: VERIFIER cannot login if FALSE (this is the critical verifier approval check)
- Indexes on `email` and `role` for optimized queries
- Automatic `updated_at` timestamp via trigger

## Security Best Practices Implemented

1. **Parameterized Queries**: All SQL queries use parameterized statements to prevent SQL injection
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **JWT Secrets**: Should be unique and complex in production
4. **HttpOnly Cookies**: Refresh tokens stored in HttpOnly, Secure cookies
5. **CORS**: Configured with trusted origins in production
6. **Role-Based Access Control**: Middleware-enforced authorization
7. **Error Handling**: No sensitive information leaked in error messages

## Building for Production

```bash
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Running Production

```bash
pnpm start
```

Or with a process manager like PM2:

```bash
pm2 start dist/index.js --name "auth-service"
```

## Environment-Specific Notes

### Development
- `NODE_ENV="development"`
- Cookies are NOT secure (set `secure: false`)
- Can test with `curl` and Postman

### Production
- `NODE_ENV="production"`
- Cookies are secure (set `secure: true`, requires HTTPS)
- Use strong JWT secrets from environment
- Use production database URL with connection pooling
- Enable CORS only for trusted domains

## Testing the Verifier Approval Flow

1. **Register as Verifier** (cannot login yet):
   ```bash
   POST /api/auth/signup with role=VERIFIER
   ```

2. **Try to Login** (fails with approval message):
   ```bash
   POST /api/auth/login with verifier email
   # Response: "Your account has not been approved by the Advocate yet"
   ```

3. **Advocate Approves Verifier**:
   ```bash
   PATCH /api/users/verify/{verifierId} as ADVOCATE
   ```

4. **Verifier Can Now Login**:
   ```bash
   POST /api/auth/login with verifier email
   # Response: success with accessToken
   ```

## Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT creation and verification
- **cookie-parser**: Parse cookies from requests
- **swagger-jsdoc**: Generate OpenAPI spec from JSDoc
- **swagger-ui-express**: Interactive API documentation
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing

## Contributing

When adding new endpoints:

1. Add comprehensive JSDoc comments with `@openapi` tags
2. Use parameterized queries for database operations
3. Implement proper error handling and validation
4. Follow the existing response format (`{ success, message, data }`)
5. Add middleware for authentication/authorization where needed

## License

ISC

## Support

For issues or questions, refer to:
- Swagger UI: http://localhost:5000/api-docs
- Database: Check init.sql for schema details
- Environment: Review .env configuration
