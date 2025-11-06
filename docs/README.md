envlink-api/docs/README.md

# EnvLink-API Documentation

EnvLink-API is a modular, production-ready backend API built with [NestJS](https://nestjs.com/). It provides robust features for authentication, user management, URL/link management, payment processing, subscriptions, analytics, and more. This documentation provides an overview of the architecture, modules, and usage for developers and integrators.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
  - [Authentication (`auth`)](#authentication-auth)
  - [User Management (`user`)](#user-management-user)
  - [Account Verification (`account`)](#account-verification-account)
  - [Session Management (`session`)](#session-management-session)
  - [URL Management (`urls`)](#url-management-urls)
  - [Payment Methods & Transactions (`payment-methods`, `transactions`)](#payment-methods--transactions-payment-methods-transactions)
  - [Subscriptions (`subscriptions`)](#subscriptions-subscriptions)
  - [Webhooks (`webhooks`)](#webhooks-webhooks)
  - [Queue & Jobs (`queue`)](#queue--jobs-queue)
  - [Health Checks (`health`)](#health-checks-health)
  - [Common Utilities (`common`)](#common-utilities-common)
  - [Database & Redis (`database`, `redis`)](#database--redis-database-redis)
- [Configuration](#configuration)
- [Testing](#testing)
- [Development & Deployment](#development--deployment)
- [Custom Types](#custom-types)
- [API Requests & Examples](#api-requests--examples)
- [License](#license)

---

## Overview

EnvLink-API is designed for scalable, secure, and maintainable backend services. It leverages NestJS's modular architecture, TypeScript, and best practices for API development. The API supports authentication, user and session management, payment integrations, URL/link management, and more, making it suitable for SaaS, analytics, or link management platforms.

---

## Architecture

- **Framework:** [NestJS](https://nestjs.com/) (Node.js, TypeScript)
- **Database:** Configurable (see `src/config/database.config.ts`)
- **Caching/Session:** Redis integration
- **Job Queue:** Modular queue system
- **Testing:** Jest, HTTP request collections
- **Deployment:** Docker, Docker Compose, PM2 ecosystem

---

## Project Structure

```
envlink-api/
├── src/
│   ├── account/           # Account verification and related logic
│   ├── auth/              # Authentication, guards, strategies
│   ├── common/            # Shared utilities, decorators, enums, filters, etc.
│   ├── config/            # Configuration files (env, db, jwt, swagger, etc.)
│   ├── database/          # Entities, repositories, seeders
│   ├── health/            # Health check endpoints
│   ├── payment-methods/   # Payment method management
│   ├── queue/             # Queue constants, workers, interfaces
│   ├── redis/             # Redis integration (empty by default)
│   ├── session/           # Session management
│   ├── subscriptions/     # Subscription logic and cycles
│   ├── transactions/      # Transaction management
│   ├── urls/              # URL/link management
│   ├── user/              # User management
│   ├── webhooks/          # Webhook endpoints and logic
│   ├── app.module.ts      # Main NestJS module
│   └── main.ts            # Application entry point
├── types/                 # Custom TypeScript type definitions
├── views/                 # HTML templates (e.g., card.html)
├── requests/              # HTTP request collections for testing
├── test/                  # End-to-end tests and Jest config
├── docs/                  # Project documentation
├── Dockerfile*            # Docker build files
├── docker-compose*.yml    # Docker Compose configs
├── ecosystem.config.js    # PM2 process manager config
├── *.json, *.js, *.sh     # Config and utility scripts
└── README.md              # Project overview (not this file)
```

---

## Example API Usage

Below are some example HTTP requests for common API operations. You can use these with tools like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or Postman.

### Register a User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "password123",
  "confirm_password": "password123"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "johndoe@example.com",
  "password": "password123"
}
```

### Get Current User

```http
GET /api/v1/user/me
Authorization: Bearer <accessToken>
```

### Create Short URL

```http
POST /api/v1/urls
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "originalUrl": "https://tamamhuda.dev",
  "channelIds": ["81100e9e-61f2-4b47-add6-5e79b2b2e080"]
}
```

### Get All Transactions

```http
GET /api/v1/transactions
Authorization: Bearer <accessToken>
```

### Health Check

```http
GET /api/v1/health
```

---

## Core Modules

### Authentication (`auth`)

- **Files:** `auth.controller.ts`, `auth.service.ts`, `auth.module.ts`
- **Features:** JWT-based authentication, guards, strategies, DTOs for login/register, secure endpoints.

#### API Endpoints

- `POST /api/v1/auth/register`
  Register a new user.
  **Body:**
  ```json
  {
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "password123",
    "confirm_password": "password123"
  }
  ```
- `POST /api/v1/auth/login`
  Login with username/email and password.
  **Body:**
  ```json
  {
    "username": "johndoe@example.com",
    "password": "password123"
  }
  ```
- `POST /api/v1/auth/refresh`
  Refresh JWT tokens.
  **Header:** `Authorization: Bearer <refreshToken>`
- `GET /api/v1/auth/verify?token=...`
  Verify email with token.

### User Management (`user`)

- **Files:** `user.controller.ts`, `user.service.ts`, `user.module.ts`
- **Features:** CRUD operations for users, user profile management, user mapping utilities.

#### API Endpoints

- `GET /api/v1/user/me`
  Get current user info.
  **Header:** `Authorization: Bearer <accessToken>`
- `PUT /api/v1/user/update/:id`
  Update user info.
  **Body:**
  ```json
  {
    "fullName": "John Doe Update"
  }
  ```
- `POST /api/v1/user/image/upload`
  Upload user avatar image (multipart/form-data).

### Account Verification (`account`)

- **Files:** `account.controller.ts`, `account.service.ts`, `account-verify.service.ts`, `account.module.ts`
- **Features:** Account verification flows (e.g., email verification), related DTOs.

#### API Endpoints

- `POST /api/v1/account/logout`
  Logout user (invalidates session).
- `POST /api/v1/account/verify/resend`
  Resend verification email.
  **Header:** `Authorization: Bearer <accessToken>`
- `POST /api/v1/account/change-password`
  Change password.
  **Body:**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```

### Session Management (`session`)

- **Files:** `session.controller.ts`, `session.service.ts`, `session.module.ts`
- **Features:** Session creation, validation, and management.

#### API Endpoints

- `GET /api/v1/session?isActive=true`
  Get all active sessions for the user.
- `GET /api/v1/session/:id`
  Get session by ID.
- `POST /api/v1/session/revoke/:id`
  Revoke a specific session.
- `POST /api/v1/session/revoke`
  Revoke all user sessions.

### URL Management (`urls`)

- **Files:** `urls.controller.ts`, `urls.service.ts`, `urls.module.ts`
- **Features:** URL creation, management, public/private endpoints, DTOs for URL operations.

#### API Endpoints

- `POST /api/v1/urls`
  Create a new short URL.
  **Body:**
  ```json
  {
    "originalUrl": "https://tamamhuda.dev",
    "channelIds": ["81100e9e-61f2-4b47-add6-5e79b2b2e080"]
  }
  ```
- `GET /api/v1/urls/:id`
  Get a short URL by ID.
- `GET /api/v1/urls`
  Get all short URLs for the user.
- `PUT /api/v1/urls/:id`
  Update a short URL.
- `DELETE /api/v1/urls/:id`
  Delete a short URL.

### Payment Methods & Transactions (`payment-methods`, `transactions`)

- **Files:** Controllers, services, modules for both payment methods and transactions.
- **Features:** Manage payment methods, process transactions, mapping utilities, DTOs for payment and transaction flows.

#### Payment Methods API Endpoints

- `GET /api/v1/payment-methods`
  Get all payment methods for the user.
- `GET /api/v1/payment-methods/:id`
  Get payment method by ID.
- `POST /api/v1/payment-methods`
  Create a new payment method.
- `PATCH /api/v1/payment-methods/sort`
  Sort payment methods.
- `GET /api/v1/payment-methods/requests`
  Get requested payment methods.

#### Transactions API Endpoints

- `GET /api/v1/transactions`
  Get all transactions (supports filters: startDate, endDate, status).
- `GET /api/v1/transactions/:id`
  Get transaction by ID.

### Subscriptions (`subscriptions`)

- **Files:** `subscriptions.controller.ts`, `subscriptions.service.ts`, `subscriptions-callback.service.ts`, `subscriptions-cycles.service.ts`, `subscriptions.module.ts`
- **Features:** Subscription lifecycle management, callbacks, recurring billing logic.

#### API Endpoints

- `GET /api/v1/subscriptions/active`
  Get user's active subscription.
- `GET /api/v1/subscriptions/active/cycles`
  Get all active subscription cycles.
- `GET /api/v1/subscriptions/:id`
  Get subscription by ID.
- `GET /api/v1/subscriptions/:id/cycles`
  Get all cycles for a subscription.
- `GET /api/v1/subscriptions/:id/cycles/:cycleId`
  Get a specific subscription cycle.
- `POST /api/v1/subscriptions/:id/deactivate`
  Deactivate a subscription.
- `POST /api/v1/subscriptions/:id/plans/upgrade`
  Upgrade a subscription plan.
- `GET /api/v1/subscriptions/:id/plans/upgrade/options`
  Get available upgrade options.

### Webhooks (`webhooks`)

- **Files:** `webhooks.controller.ts`, `webhooks.service.ts`, `webhooks.module.ts`
- **Features:** Handle incoming/outgoing webhooks for integrations.

#### API Endpoints

- `POST /api/v1/webhooks/xendit/payment_methods`
  Handle Xendit payment methods callback.
- `POST /api/v1/webhooks/xendit/recurring`
  Handle Xendit recurring plan callback.

### Queue & Jobs (`queue`)

- **Files:** `queue.module.ts`, constants, interfaces, workers
- **Features:** Background job processing, queue management.

Jobs are managed using BullMQ and custom workers. See `src/queue/workers` for implementation details.

### Health Checks (`health`)

- **Files:** `health.controller.ts`, `health.module.ts`, `ip-health.indicator.ts`
- **Features:** Health endpoints for monitoring and uptime checks.

#### API Endpoints

- `GET /api/v1/health`
  Returns health status for database, cache, Redis, and IP geolocation.

### Common Utilities (`common`)

- **Folders:** `cache`, `decorators`, `dto`, `enums`, `filters`, `interceptors`, `interfaces`, `logger`, `middlewares`, `schemas`, `throttle`, `utils`, `xendit`
- **Features:** Shared logic, custom decorators, error filters, logging, throttling, and utility functions.

#### Highlights

- **Decorators:** For caching, throttling, authentication, etc.
- **Logger:** Centralized logging with support for HTTP, jobs, and custom messages.
- **Enums & DTOs:** Standardized data transfer and validation.
- **Utils:** Helpers for AWS S3, IP geolocation, and more.

### Database & Redis (`database`, `redis`)

- **Database:** Entities, repositories, seeders for ORM/database integration.
- **Redis:** Placeholder for Redis-related logic (empty by default).

Database configuration is flexible and supports migrations, seeding, and custom repositories.

---

## Configuration

- **Environment:** `src/config/env.config.ts`
- **Database:** `src/config/database.config.ts`
- **JWT:** `src/config/jwt.config.ts`
- **Swagger:** `src/config/swagger.config.ts`
- **Cache:** `src/config/cache.config.ts`
- **Logging:** `src/config/winston.config.ts`
- **Signed URLs:** `src/config/signed-url.config.ts`

Configuration is modular and environment-driven. Use `.env` files or environment variables for secrets and deployment-specific settings.

**Example `.env` variables:**

```
DATABASE_URL=postgres://user:password@localhost:5432/envlink
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## Testing

- **End-to-End:** Located in `test/` (e.g., `app.e2e-spec.ts`)
- **HTTP Requests:** Use files in `requests/` for manual or automated endpoint testing.
- **Jest:** Configured for unit and integration tests.

**Run tests:**

```sh
npm run test
npm run test:e2e
```

---

## Development & Deployment

- **Local Development:** Use Docker Compose (`docker-compose.dev.yml`) or run with Node.js.
- **Production:** Use `Dockerfile`, `docker-compose.prod.yml`, and `ecosystem.config.js` for PM2.
- **Scripts:** Entry points and utility scripts (`entrypoint.sh`, `entrypoint.dev.sh`).

**Start in development:**

```sh
docker-compose -f docker-compose.dev.yml up
# or
npm run start:dev
```

**Build for production:**

```sh
docker-compose -f docker-compose.prod.yml up --build
# or
npm run build
npm run start:prod
```

---

## Custom Types

- **Location:** `types/`
- **Purpose:** Extend or override TypeScript definitions for Express, IP2Location, ZeptoMail, etc.

---

## API Requests & Examples

- **Location:** `requests/`
- **Files:** `.http` files for authentication, health, session, URLs, user, etc.
- **Usage:** Import into tools like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or [Postman] for quick API testing.

**See the `requests/` directory for ready-to-use HTTP request files.**

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the code style and linting rules.
3. Write tests for new features or bug fixes.
4. Submit a pull request with a clear description.

---

## Contact

For questions, issues, or contributions, please contact the developer or open an issue on the repository.

---

**EnvLink-API** is designed for extensibility and production-readiness. Explore the modules and configuration to tailor it to your needs!
