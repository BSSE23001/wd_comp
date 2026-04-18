# Pre-Launch Checklist

Use this checklist to verify everything is properly set up before running the service.

## ✅ Installation

- [ ] Dependencies installed: `pnpm install` completed without errors
- [ ] No "module not found" errors when importing files
- [ ] bcrypt and jsonwebtoken are in node_modules

## ✅ File Structure

- [ ] `src/db/index.ts` exists
- [ ] `src/db/init.sql` exists
- [ ] `src/types/index.ts` exists
- [ ] `src/middlewares/auth.middleware.ts` exists
- [ ] `src/controllers/auth.controller.ts` exists
- [ ] `src/controllers/user.controller.ts` exists
- [ ] `src/routes/auth.routes.ts` exists
- [ ] `src/routes/user.routes.ts` exists
- [ ] `src/index.ts` exists and imports all above

## ✅ Environment Configuration

- [ ] `.env` file created (or use `.env.example`)
- [ ] `DATABASE_URL` is set to your PostgreSQL connection
- [ ] `JWT_SECRET` is set (at least 16 characters)
- [ ] `JWT_REFRESH_SECRET` is set (different from JWT_SECRET)
- [ ] `ADVOCATE_EMAIL` is set
- [ ] `ADVOCATE_PASSWORD` is set
- [ ] `NODE_ENV` is set to "development"
- [ ] `PORT` is set (default: 5000)

## ✅ Database Preparation

- [ ] PostgreSQL server is running
- [ ] Database exists and is accessible
- [ ] Connection string in DATABASE_URL is correct
- [ ] User has permissions to create tables

## ✅ Code Quality

- [ ] No TypeScript errors: `pnpm build` succeeds
- [ ] All imports use correct relative paths
- [ ] Middleware is properly applied to routes
- [ ] JWT secrets are not committed to git (use .env)

## ✅ Security Checks

- [ ] `is_approved_by_advocate` check in login endpoint
- [ ] Verifier cannot login without approval
- [ ] Only Advocate can call `/api/users/verify/{id}`
- [ ] Password hashing uses bcrypt
- [ ] SQL queries use parameterized statements
- [ ] No sensitive info in error messages

## ✅ Swagger Documentation

- [ ] Every endpoint has JSDoc @openapi comments
- [ ] Request/response schemas are defined
- [ ] Security scheme is configured
- [ ] Example values are provided

## ✅ Routes Validation

Public Routes:
- [ ] `POST /api/auth/signup` - Registration
- [ ] `POST /api/auth/login` - Login
- [ ] `POST /api/auth/refresh` - Token refresh
- [ ] `POST /api/auth/logout` - Logout

Protected Routes:
- [ ] `GET /api/users/me` - Get profile
- [ ] `PUT /api/users/me` - Update profile
- [ ] `DELETE /api/users/me` - Delete account
- [ ] `GET /api/users` - List users (ADVOCATE only)
- [ ] `PATCH /api/users/verify/{verifierId}` - Approve Verifier

## ✅ Test Commands

Before launching, run these tests:

### Start Server
```bash
pnpm dev
```
- [ ] Server starts without errors
- [ ] "Database connection successful" message appears
- [ ] "Database schema initialized" message appears
- [ ] Server listens on correct PORT

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```
- [ ] Returns `{"status":"ok",...}`

### Test Swagger UI
```
http://localhost:5000/api-docs
```
- [ ] Loads without errors
- [ ] All endpoints are visible
- [ ] Can expand endpoint details

### Test Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","role":"WORKER"}'
```
- [ ] Returns 201 Created
- [ ] Response includes accessToken
- [ ] Response includes user details
- [ ] Refresh token set in cookie

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```
- [ ] Returns 200 OK
- [ ] Response includes accessToken
- [ ] Can use token for protected routes

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer {accessToken}"
```
- [ ] Returns 200 OK
- [ ] Returns user profile data
- [ ] Returns 401 without token

### Test Verifier Approval Flow
```bash
# Sign up as Verifier
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"verifier@test.com","password":"Test123!","role":"VERIFIER"}'

# Try to login (should fail)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verifier@test.com","password":"Test123!"}'
```
- [ ] Signup succeeds
- [ ] Login returns "not approved" error message

## ✅ Package.json Verification

- [ ] All dependencies listed:
  - [ ] bcrypt
  - [ ] cookie-parser
  - [ ] cors
  - [ ] dotenv
  - [ ] express
  - [ ] jsonwebtoken
  - [ ] pg
  - [ ] swagger-jsdoc
  - [ ] swagger-ui-express

- [ ] All @types dependencies listed:
  - [ ] @types/bcrypt
  - [ ] @types/cookie-parser
  - [ ] @types/express
  - [ ] @types/jsonwebtoken
  - [ ] @types/node
  - [ ] @types/pg
  - [ ] @types/swagger-jsdoc
  - [ ] @types/swagger-ui-express

## ✅ Documentation

- [ ] README.md exists and is comprehensive
- [ ] QUICKSTART.md exists with examples
- [ ] API_REFERENCE.md exists with all endpoints
- [ ] DEPLOYMENT.md exists for production
- [ ] IMPLEMENTATION_SUMMARY.md exists for overview
- [ ] .env.example exists as template

## ✅ Git Configuration

- [ ] `.gitignore` includes:
  - [ ] node_modules/
  - [ ] .env (not .env.example)
  - [ ] dist/
  - [ ] *.log

- [ ] No .env file committed (use .env.example only)
- [ ] No node_modules committed

## ✅ Production Readiness

- [ ] Error handling covers all edge cases
- [ ] No console.log calls left in production code
- [ ] Database queries are optimized
- [ ] Indexes are created on frequently queried columns
- [ ] CORS is properly configured
- [ ] Rate limiting considered (for future)
- [ ] Logging/monitoring ready (for future)

## ✅ Final Verification

Run this script to verify the setup:

```bash
#!/bin/bash
echo "FairGig Auth Service - Setup Verification"
echo "=========================================="

# Check Node.js
node -v || echo "❌ Node.js not installed"

# Check pnpm
pnpm -v || echo "❌ pnpm not installed"

# Check TypeScript
pnpm tsc --version || echo "❌ TypeScript not installed"

# Check database connection
echo "Checking database..."
node -e "
const pg = require('pg');
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.log('❌ Database connection failed:', err.message);
  else console.log('✅ Database connection successful');
  pool.end();
});
"

echo ""
echo "Setup verification complete!"
echo "Run 'pnpm dev' to start the server"
```

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| Module not found | Run `pnpm install` again |
| Database not found | Check DATABASE_URL in .env |
| Port in use | Change PORT in .env |
| JWT errors | Regenerate JWT_SECRET and JWT_REFRESH_SECRET |
| TypeScript errors | Run `pnpm build` to see all errors |
| Swagger not loading | Check that swagger paths in index.ts are correct |

## 🚀 Launch

Once all checkboxes are checked:

```bash
# Development
pnpm dev

# Production (after building)
pnpm build
pnpm start
```

Access the service:
- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

---

**Status**: Ready to launch! ✅

For questions, refer to:
- README.md for overview
- QUICKSTART.md for quick start
- API_REFERENCE.md for endpoints
- DEPLOYMENT.md for production
