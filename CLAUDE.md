# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fenpai** (分派) is a full-stack bill-splitting PWA for Taiwan. Monorepo with:
- **Frontend**: React 19 + Vite 7 + React Router 7 + TailwindCSS 4
- **Backend**: Spring Boot 3.2 + Java 17
- **Database**: PostgreSQL 16 with Flyway migrations
- **Auth**: JWT + Spring Security + Google OAuth SSO
- **Real-time**: WebSocket (STOMP via SockJS)
- **Payments**: TWQR (Taiwan unified QR payment standard, 50+ banks)

## Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run lint      # ESLint check
npm run preview   # Preview built app
```

### Backend (`backend/`)
```bash
./mvnw spring-boot:run                              # Run in dev mode (port 8080)
./mvnw clean test                                   # All tests (uses H2 in-memory)
./mvnw test -Dtest=ClassName                        # Single test class
./mvnw test -Dtest=ClassName#methodName             # Single test method
./mvnw clean package                                # Build artifact
```

### Docker (root)
```bash
docker compose up --build                # Full stack
docker compose up postgres -d            # Just PostgreSQL
docker compose down -v                   # Stop and remove volumes
```

### Local Development Setup
1. Copy `.env.example` → `.env`; set `JWT_SECRET` (`openssl rand -hex 64`) and `GOOGLE_CLIENT_ID`
2. `docker compose up postgres -d`
3. `cd backend && ./mvnw spring-boot:run`
4. `cd frontend && npm install && npm run dev` (Vite proxies `/api` → `:8080`)

Optional: `RESEND_API_KEY` for invitation emails; without it, invite links print to console.

## Architecture

### Frontend

**Routing & Auth** — [src/App.jsx](frontend/src/App.jsx) defines all routes. `ProtectedRoute` guards authenticated pages. `AuthContext` ([src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)) holds JWT + user state in `localStorage`.

**API Layer** — All backend calls go through `apiFetch()` in [src/lib/api.js](frontend/src/lib/api.js), which automatically injects the `Bearer` token from `AuthContext`.

**Pages**: Dashboard, Groups, GroupDetail, AddExpense, Records, Profile, Login, Register, InviteAccept, QRGenerator.

**PWA** — `vite-plugin-pwa` with Workbox; installable on iOS/Android with offline support.

### Backend

**Package layout**: `com.fenpai.{controller,service,repository,model,config,dto,security}`

**Controllers → Services → Repositories** (standard Spring layering):
- `AuthController` → `UserService` + `GoogleTokenService`: register, login, Google SSO
- `GroupController` → `GroupService`: CRUD, member management
- `ExpenseController` → `ExpenseService`: create with equal/custom splits
- `BalanceController` → `BalanceService`: settlement amounts + payment recording
- `InvitationController` → `InvitationService`: email invitations via Resend API
- `AccountController` → `AccountService`: TWQR bank accounts

**Settlement algorithm** — `BalanceService` uses a greedy minimum-transaction algorithm to reduce debts. All monetary values use `BigDecimal` / `NUMERIC(12,2)` in DB — never `float`/`double`.

**Security** — `JwtAuthenticationFilter` extracts JWT from `Authorization: Bearer` header on every request. `SecurityConfig` defines the filter chain, CORS, and stateless session policy. Public endpoints: `POST /api/auth/**`, `GET /api/invite/{token}`.

**Database** — Flyway migrations in `backend/src/main/resources/db/migration/`. Add new files as `V{n}__description.sql`. Tables: `users`, `accounts`, `groups`, `group_members`, `expenses`, `expense_splits`, `payments`, `group_invitations`, `external_identities`.

**OAuth extensibility** — `ExternalIdentityService` links providers to users. Google is implemented; the schema supports GitHub.

**Transactions** — Services use `@Transactional`. `spring.jpa.open-in-view=false` is set; always access lazy associations inside a transaction.

**Profiles** — `application.properties` (dev, safe defaults) vs. `application-prod.properties` (strict, no defaults). The prod profile is active in Docker via `SPRING_PROFILES_ACTIVE=prod`.
