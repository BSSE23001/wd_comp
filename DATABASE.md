# Database Schema Documentation: Worker Insights & Grievance System

This document outlines the PostgreSQL database structure used for the Worker Insights platform. The schema is designed to track worker activity, verify earnings, and manage labor grievances within the gig economy.

## 🛠 Tech Stack Integration
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma V7 (ESM-based architecture)
- **Auth:** Linked via Clerk/Supabase `User` ID
- **Storage:** Supabase Storage (Buckets for `screenshotUrl`)

---

## 1. Core Identity Tables

### `User`
The primary table for all system participants (Workers, Verifiers, Admins).
* `id`: Primary Key (maps to Auth provider ID).
* `email`: User's login email.
* `passwordHash`: Stored credentials.
* `role`: Enum (e.g., WORKER, VERIFIER, ADMIN).
* `approvalStatus`: Tracks onboarding progress (Default: `PENDING`).

### `WorkerProfile`
Extended metadata specific to users registered as gig workers.
* `userId`: Foreign Key to `User`.
* `category`: Type of work (e.g., Delivery, Transport).
* `cityZone`: Localized operating area.
* `defaultCurrency`: Set to `PKR` by default.

### `Platform`
A registry of supported gig-economy companies.
* `name`: Name of the platform (e.g., Foodpanda, Uber, Bykea).
* `isActive`: Boolean to enable/disable platform-wide tracking.

---

## 2. Activity Tracking

### `ShiftLog`
Records and verifies the financial data of a worker's shift.
* `workerId`: Reference to the `User`.
* `platformId`: The platform where the shift occurred.
* `hoursWorked`: Duration of work.
* `grossEarned` / `netReceived`: Financial breakdown in `PKR`.
* `screenshotUrl`: Public URL from Supabase Storage used for manual verification.
* `status`: Enum (`PENDING`, `VERIFIED`, `REJECTED`).
* `verifierId`: Reference to the `User` (Staff) who audited the log.

---

## 3. Grievance & Intelligence

### `GrievancePost`
A worker-submitted report regarding an issue or complaint.
* `category`: Type of grievance (e.g., Pay Dispute, Safety).
* `description`: Detailed text of the issue.
* `rateIntel`: Numerical value for sentiment or impact analysis.
* `tags`: Array used for filtering and search.
* `clusterId`: Optional link to group similar reports.

### `GrievanceCluster`
Aggregates multiple `GrievancePosts` to identify systemic trends across platforms or regions.

### `VulnerabilityFlag`
Used by the system or admins to mark specific workers requiring urgent intervention or support.
* `type`: Categorization of the risk level.
* `isResolved`: Boolean for case management tracking.

---

## 🔗 Key Relationships

| From Table | To Table | Relationship | Description |
| :--- | :--- | :--- | :--- |
| `User` | `WorkerProfile` | 1:1 | Every worker has one profile. |
| `User` | `ShiftLog` | 1:N | One worker can submit many logs. |
| `Platform` | `ShiftLog` | 1:N | Platforms aggregate many logs. |
| `GrievanceCluster`| `GrievancePost` | 1:N | Trends group individual complaints. |
| `User` (Verifier) | `ShiftLog` | 1:N | Admins can verify multiple logs. |

---

## 📋 Implementation Notes for Agents
- **Environment Variables:** Ensure `DATABASE_URL` (Connection Pooling) and `DIRECT_URL` (Migrations) are set in the environment.
- **Prisma Client:** When querying, always use the `adapter-pg` logic required for Prisma V7.
- **Data Integrity:** `netReceived` should ideally be calculated as `grossEarned - platformDeductions`.