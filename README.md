Multi-School ERP Backend

A robust backend service for a multi-school ERP system, built with Node.js, Express, MySQL, and Sequelize, enforcing strict multi-tenancy, role-based access control, and secure authentication flows.

This system ensures complete data isolation between schools, while allowing a central superadmin to manage everything.


Features Overview

* Multi-school (multi-tenant) architecture with strict data isolation
* School management with school-scoped users and students
* JWT-based authentication
* Role-based access control (RBAC) with three roles: Superadmin, Admin, User
* User management with role and permission handling
* Secure user onboarding with auto-generated passwords
* Forced password change on first login
* Password reset via email link
* Student CRUD operations with permission checks
* Soft delete strategy for students
* Audit logging for student create, update, and delete actions
* Database transactions for critical operations
* Comprehensive automated tests (unit and integration)


Tech Stack

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* JWT (authentication)
* Joi (request validation)
* bcrypt (password hashing)
* Nodemailer for email delivery (password & reset links)
* Jest + Supertest (testing)

Roles & Permissions

Superadmin

* Full access across all schools
* Can create users in any school
* Can manage all students
* Bypasses school-scoping restrictions

 Admin (School-level)

* Scoped to one school
* Can create users in their school
* Can manage students only within their school
* Cannot access other school's data

User

* Read-only access by default
* Can edit students only if `canEditStudents = true`
* Always restricted to own school

Authentication & Authorization

Authentication

* JWT-based authentication
* Token payload includes:

  * `userId`
  * `role`
  * `schoolId`
  * `canEditStudents`

http
Authorization: Bearer <access_token>


Authorization & Multi-Tenancy

* All school-scoped routes enforce `schoolId` validation
* Cross-school access is strictly blocked
* Middleware used:

  * `requireRole`
  * `requireSameSchoolOrSuperAdmin`
  * `requireStudentWriteAccess`

Password & Email Flow

User Creation

* Password is auto-generated
* Stored only as a bcrypt hash
* Cleartext password is never stored

Email Delivery

* Generated password + reset link sent via email using nodemailer
* Email sending is stubbed/mocked in tests

First Login Security

* User is forced to change password on first login
* Reset tokens:

  * Securely hashed
  * Time-limited expiry

API Endpoints

Authentication

http
POST /auth/login
POST /refresh
POST /reset-password

Schools

http
GET    /schools
POST   /schools
GET    /schools/:id


Users

http
POST   /schools/:schoolId/users
GET    /schools/:schoolId/users
GET    /users/:id
PATCH  /users/:id


Students

http
POST    /schools/:schoolId/students
GET     /schools/:schoolId/students
GET     /schools/:schoolId/students/:id
PATCH   /schools/:schoolId/students/:id
DELETE  /schools/:schoolId/students/:id


Automated Tests

The project includes unit and integration tests covering all required evaluation criteria.

Covered Test Scenarios

* Authentication flows

  * Login
  * Protected routes
* User creation

  * Password generation
  * Email sending (stubbed)
* Authorization

  * Cross-school access prevention
* Student permissions

  * Create / Update / Delete
  * Role & permission enforcement

Test Stack

* Jest
* Supertest
* Isolated test database
* Database reset before each test suite

npm test

Database Design & Data Safety

* All entities scoped by `schoolId`
* Students use soft delete (`isDeleted = true`)
* Audit logs track:

  * CREATE
  * UPDATE
  * DELETE
* Critical operations wrapped in transactions

  * User creation
  * Email dispatch

Postman Collection

A Postman collection is included to test all APIs manually.

Collection Covers

* Authentication
* School management
* User management
* Student CRUD
* Authorization edge cases

Usage:

1. Import the Postman collection
2. Start testing endpoints

Environment Setup

Prerequisites

* Node.js (v18+ recommended)
* MySQL

Environment Variables

Create a `.env` file:

env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=

NODE_ENV=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_FROM=
SMTP_PASS=

FRONTEND_URL=


For testing:

env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=

NODE_ENV=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_FROM=
SMTP_PASS=

#Running the Project

# Install dependencies
npm install

# Run the server
npm run dev

# Run tests
npm test

Security & Edge Cases

* Passwords stored using bcrypt
* No cleartext password persistence
* JWT expiration enforced
* Forced password change on first login
* School-level isolation enforced at middleware + query level
* Soft delete prevents accidental data loss
* Audit logs provide traceability
* Transactions prevent partial failures

Security & Edge Cases

This application is designed with security-first and multi-tenant isolation as core principles.

JWT Expiration & Refresh Strategy

* Authentication is handled using JWT access tokens and refresh tokens
* Each token contains:

  * `userId`
  * `role`
  * `schoolId`
  * `canEditStudents`
* Tokens are signed using a secret key and include an expiration time
* Expired or invalid tokens are rejected at the middleware level

jwt.verify(token, JWT_SECRET)

* All protected routes are guarded by authentication middleware
* Requests with:

  * Missing token
  * Expired token
  * Invalid token
    are rejected with `401 Unauthorized`

> Refresh Token Flow

When an access token expires, the client can call the refresh endpoint
The refresh endpoint:
Validates the refresh token, Issues a new access token, This allows users to remain authenticated without re-entering credentials. Refresh tokens are used only for token renewal and are never accepted for accessing protected routes
This approach:
Limits exposure of short-lived access tokens
Improves user experience
Maintains strong security boundaries


Server-side token storage complexity

This design favors simplicity and security over persistent session tokens.
Password Storage & Handling

* Passwords are never stored in cleartext
* All passwords are hashed using bcrypt
* During user creation:

  * A strong password is auto-generated
  * Only the hashed password is stored in the database


* The raw password is:

  * Sent only once via email
  * Never logged
  * Never persisted

* On first login:

  * Users are forced to change their password
  * Enforced via `mustChangePassword` flag

Multi-Tenancy & Cross-School Data Protection

Strict multi-tenancy is enforced at both middleware and database query levels.

Middleware Enforcement

* All school-scoped routes validate `schoolId`
* Access rules:

  * Superadmin → unrestricted
  * Admin/User → restricted to their own school


Database Enforcement

* Queries always include `schoolId` in `WHERE` clauses
* Even if a request bypasses routing, data isolation remains intact

This guarantees:

* No user can read or mutate another school’s data
* No accidental data leakage across tenants

Student Deletion vs Soft Delete Strategy

* Students are soft-deleted, not permanently removed
* Implemented using an `isDeleted` flag

where: { isDeleted: false }

Why soft delete?

* Prevents accidental data loss
* Preserves historical references
* Allows auditing and future recovery

Behavior:

* Soft-deleted Students:

  * Cannot authenticate
  * Are excluded from all queries
* Data integrity remains intact across related entities

Audit Logging (Students)

* All student mutations are logged:

  * CREATE
  * UPDATE
  * DELETE
* Each audit record stores:

  * Actor (userId)
  * Action type
  * Before state
  * After state
  * Timestamp

This ensures:

* Full traceability
* Accountability
* Compliance readiness

Failure Safety & Transactions

* Critical operations (e.g. user creation + email dispatch) are wrapped in database transactions
* If any step fails:

  * The transaction is rolled back
  * No partial or inconsistent data is stored

Summary

This system ensures:

* Secure authentication
* Strong password protection
* Strict tenant isolation
* Safe deletion strategies
* Complete auditability

All critical security and edge cases required by the task are fully implemented and tested.




