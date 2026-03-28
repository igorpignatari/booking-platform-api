# 📅 BookingApp

A multi-niche SaaS booking platform built with Node.js and TypeScript, supporting businesses like barbershops, restaurants, dental clinics, and more.

---

## 🧱 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL with pg-promise
- **Auth:** JWT + Refresh Token (httpOnly cookies)
- **Architecture:** Clean Architecture / Modular Monolith / Domain Driven Design /Hexagonal Architecture

---

## 🗂️ Architecture Overview

The project follows **Clean Architecture** principles, ensuring separation of concerns and framework-agnostic design.

```
src/
├── core/                     # Domain contracts and base types
│   └── repositories/         # Shared repository interfaces
│
├── shared/                   # Shared utilities and helpers
│
└── contexts/                 # Business contexts (bounded contexts)
    ├── users/                # User management
    ├── auth/                 # Authentication & authorization
    ├── business/             # Business, services and resources
    ├── bookings/             # Bookings and customers
    └── payments/             # Subscriptions and payments
```

### Key Principles

- **No direct cross-context imports** — contexts communicate via interfaces defined in `core/`
- **Multi-tenancy enforced via `businessId`** — every resource is scoped to a business
- **Framework-agnostic controllers** — controllers return a plain object `{ statusCode, data, cookies }`, decoupled from Express/Fastify
- **Result pattern** — use cases return `Result<T>` instead of throwing exceptions for expected errors

### Context Overview

| Context | Responsibility |
|---|---|
| `users/` | User registration, profile, password management |
| `auth/` | Login, logout, token refresh, password reset |
| `business/` | Business registration, services and resources |
| `bookings/` | Booking creation and customer data |
| `payments/` | Subscriptions and payment tracking |

### Domain Entities

```
User
RefreshToken
PasswordResetToken

Business       → belongs to User
Service        → belongs to Business (fixed duration)
Resource       → belongs to Business (optional — e.g. barber, table, room)

Booking        → belongs to Business, linked to Service and optional Resource
Customer       → value object inside Booking (no system registration required)

Subscription   → belongs to Business
```

---

## 🔐 Authentication Flow

- **Access Token** — short-lived JWT (15 min), sent via `Authorization: Bearer` header
- **Refresh Token** — long-lived (7 days), stored in `httpOnly` cookie and persisted in the database
- On access token expiry, the client calls `/auth/refresh-token` to rotate tokens
- Logout deletes the refresh token from the database and clears the cookie

### Auth Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate and receive tokens |
| POST | `/auth/logout` | Invalidate current session |
| POST | `/auth/logout/all-devices` | Invalidate all sessions for the user |
| POST | `/auth/refresh-token` | Rotate access and refresh tokens |

---

## 🚀 How to Run Locally

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or via Docker

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/bookingapp.git
cd bookingapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bookingapp

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7
```

### Running

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

---

## 📌 Roadmap

- [x] User — Create user
- [x] Auth — login, logout, refresh token
- [ ] Business — register business, services, resources
- [ ] Bookings — create and manage bookings
- [ ] Payments — subscriptions and plan management
- [ ] AI Agent — WhatsApp/SMS booking via conversational agent
- [ ] Forgot/reset password
- [ ] Multi-language support

---

## 📄 License

MIT
