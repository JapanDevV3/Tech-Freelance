# Tech-Freelance

> A freelance marketplace that connects people who have computer problems with independent technicians, so they can get help without carrying their machine to a repair shop.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?logo=postgresql&logoColor=white)
![CI](https://github.com/JapanDevV3/Tech-Freelance/actions/workflows/ci.yaml/badge.svg)

> 🚧 **Personal learning project, under active development.** The core marketplace flow works end to end; payments and chat are being built next. A live demo will be added once the payment flow is finished.

<!-- Add when ready:
**🔗 Live demo:** https://your-domain · **🎥 Demo video:** https://...
-->

![Tech-Freelance home page](docs/screenshots/home.png)

---

## 📌 Problem & Solution

**Problem:** When a computer breaks, it is hard to find a technician you can trust. Prices are often unclear, and most people have to take their machine to a shop.

**Solution:** Technicians list their services (remote or on-site). A customer picks a service and requests a job, the technician sends a quote, and the customer accepts it. Every step of the order is tracked, and the platform is **remote-support first**, so many problems can be solved without a visit.

## ✨ Features

**Working now**
- [x] Registration and login with separate **Customer** and **Technician** roles
- [x] Account settings with avatar upload
- [x] Technician profile and service management (create, edit, soft-delete, image gallery)
- [x] Service catalog with search, category filters and sorting
- [x] Order flow: request a job → technician sends a quote (versioned, re-quote allowed) → customer accepts, or either side cancels
- [x] Order timeline built from an audit log of every status change
- [x] Customer and technician dashboards with order statistics computed in SQL
- [x] Thai / English interface, light and dark themes

**In progress**
- [ ] Payments with **Omise** (escrow-style: money is released to the technician after the customer confirms the job)

**Planned**
- [ ] Real-time chat between customer and technician
- [ ] Ratings and reviews
- [ ] Public technician profiles and saved technicians (UI exists, still on mock data)
- [ ] Email notifications, admin panel

## 📸 Screenshots

| Service catalog | Customer dashboard |
|---|---|
| ![Service catalog with search and filters](docs/screenshots/services.png) | ![Customer dashboard](docs/screenshots/customer_dashboard.png) |
| **Order: customer view** | **Order: technician view** |
| ![Order timeline and accepted quote, customer view](docs/screenshots/order_customer.png) | ![Order timeline and accepted quote, technician view](docs/screenshots/order_tech.png) |
| **Technician dashboard** | |
| ![Technician dashboard with listed services and incoming requests](docs/screenshots/tech_dashboard.png) | |

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form, next-intl |
| Backend | REST API on Next.js Route Handlers (Node.js runtime), service and domain layers, Zod |
| Auth | Auth.js v5 (credentials, JWT sessions), bcrypt |
| Database | PostgreSQL 16, Drizzle ORM with SQL migrations |
| Security | Rate limiting (in-memory or Upstash Redis), role-based guards |
| Testing | Vitest |
| DevOps | Docker (multi-stage), Docker Compose, Caddy (automatic HTTPS), GitHub Actions |

## 🏗️ Architecture

```mermaid
flowchart LR
  U[Browser] --> C[Caddy<br/>HTTPS]
  C --> P[Next.js pages<br/>App Router]
  C --> A["REST API<br/>/api/v1 route handlers"]
  P --> S[Service layer]
  A --> S
  S --> D[Domain rules<br/>order state machine]
  S --> DB[(PostgreSQL)]
```

```
src/
├─ app/            # pages ([locale]) and REST API (api/v1)
├─ services/       # use cases: auth, catalog, orders, technician, user
├─ domain/         # pure business rules (order state machine, quote policy) + unit tests
├─ db/             # Drizzle schema and migrations
└─ lib/            # validation (Zod), API helpers, rate limiting, storage
```

**Database** — 7 tables: `users`, `technician_profiles`, `services`, `service_images`, `orders`, `quotes`, `order_status_events`.

## 💡 Technical Highlights

- **Order state machine** — every status change is a named action that says *who* may do it, *from* which states and *to* which state (`src/domain/order/state-machine.ts`). The role is checked before the state, so an error never reveals where another user's order is.
- **Safe concurrent updates** — actions on the same order run inside a transaction that locks the row with `SELECT … FOR UPDATE`, so two requests cannot change one order at the same time. Partial unique indexes and check constraints in PostgreSQL act as a second safety net (for example, only one active quote per order), and a violation becomes an HTTP 409.
- **Audit trail** — status changes and their audit events are written in the same transaction, so the order timeline is always consistent with the order.
- **Consistent API errors** — one error handler maps validation (Zod), domain and database errors to clear HTTP status codes (400, 401, 403, 404, 409).
- **Authentication & abuse protection** — Auth.js with JWT sessions; API routes return 401/403 instead of redirecting; login is rate-limited by IP and by email, and write endpoints have their own limits.
- **CI** — every push and pull request runs lint (zero warnings), type-check, unit tests, migrations on a fresh PostgreSQL database, and a production build.
- **Production setup** — multi-stage Docker image, a one-shot migration container, PostgreSQL bound to localhost only, and Caddy for automatic HTTPS. See [DEPLOYMENT.md](DEPLOYMENT.md).

## 🚀 Getting Started

### Prerequisites
- Node.js 22 (see `.nvmrc`)
- Docker (for PostgreSQL), or your own PostgreSQL 16

### Run locally

```bash
git clone https://github.com/JapanDevV3/Tech-Freelance.git
cd Tech-Freelance
cp .env.example .env
# set DATABASE_URL=postgres://cfh:cfh_local_pw@localhost:5432/computer_fix_hub
# set AUTH_SECRET (e.g. `openssl rand -base64 32`), STORAGE_DRIVER=local, RATE_LIMIT_DRIVER=memory

docker compose up -d      # starts PostgreSQL only
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Or run everything in Docker with hot reload: `docker compose --profile dev up --build`.

### Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run test` | Run unit tests (Vitest) |
| `npm run typecheck` | Type-check the project |
| `npm run lint` | Lint |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

### API

A Postman collection and a local environment are in [`postman/`](postman/).

## 🗺️ Roadmap

- [x] Auth, roles, account settings
- [x] Technician services and catalog
- [x] Order and quote lifecycle
- [x] CI pipeline and Docker production setup
- [ ] Omise payments (escrow-style)
- [ ] Real-time chat
- [ ] Reviews and public technician profiles
- [ ] Deploy a live demo with seed data and test accounts
- [ ] Email notifications and admin panel

## 👤 Author

**Nattasit Sukprasert (Japan)** — Full-Stack Developer, Bangkok
[LinkedIn](https://linkedin.com/in/nattasit-sukprasert) · [GitHub](https://github.com/JapanDevV3)
