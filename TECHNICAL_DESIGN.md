# TECHNICAL_DESIGN.md — The Hungry Unicorn Booking System

This document explains the technical design behind the end‑to‑end booking system built on the provided FastAPI mock server and a new React frontend. It focuses on the choices we made, trade‑offs, and how we would evolve the system for production.

---

## 1) Technology Stack Justification

### Frontend
- **React + TypeScript + Vite**  
  Fast dev server (HMR), small build output, strong type safety, and a huge ecosystem. The app is an SPA where SEO is not critical, so CSR is sufficient.
- **Tailwind CSS**  
  Utility-first CSS accelerates consistent, responsive UI without inventing custom design tokens. Easy to enforce accessible color tokens.
- **Axios**  
  Lightweight HTTP client with request/response interceptors for auth headers and error normalization.

### Backend
- **FastAPI (Python)**  
  High‑performance ASGI framework with first-class Pydantic validation and automatic OpenAPI docs, ideal for quickly iterating a typed API.
- **SQLAlchemy**  
  Mature ORM with explicit models and portability (SQLite for dev → PostgreSQL for prod) and good migrations via Alembic.
- **SQLite (dev)** → **PostgreSQL (prod)**  
  SQLite keeps local setup trivial; Postgres provides concurrency, durability, and features (indexes, constraints, extensions) in production.

### Tooling & Delivery
- **Uvicorn/Gunicorn** for ASGI in production.
- **Docker** for reproducible builds and deployment.
- **GitHub Actions** for CI (tests, lint, typecheck) and CD.
- **Terraform** (optional) for Infrastructure as Code and repeatability.

---

## 2) Architecture Decisions & Trade‑offs

1. **SPA + JSON API**  
   - *Decision*: React SPA communicates with a stateless FastAPI layer.  
   - *Trade‑off*: Easy horizontal scale and caching; no SSR by default (acceptable for a booking tool).

2. **Keep the given REST surface**  
   - *Decision*: Preserve the `/Restaurant/{restaurant_name}/...` shape.  
   - *Trade‑off*: Simpler integration with the template; multi‑tenant evolution may prefer a tenant id/claims rather than path segments.

3. **Mock owner auth (token) + public customer flows**  
   - *Decision*: Customers can check availability, book, and view their booking without a login; owner Dashboard requires a bearer token.  
   - *Trade‑off*: Great for demo; in prod we’ll introduce OIDC/JWT for owners and signed links or lightweight accounts for customers.

4. **Slot availability model**  
   - *Decision*: A slot is available if the base slot is marked available **and** confirmed bookings are below a capacity threshold. Create/Update/Cancel **adjust** the slot.  
   - *Trade‑off*: Simple and predictable; does not model table layouts, overlapping seating, or holds.

5. **CORS per environment**  
   - *Decision*: Allow `http://localhost:5173` in dev; strict origin lists in prod.  
   - *Trade‑off*: Avoids “*” while keeping DX smooth.

Small ASCII overview:

```
[React SPA] --HTTPS--> [FastAPI (Uvicorn/Gunicorn)] --SQL--> [Postgres]
       \____________________ CDN (static) ___________________/
```

---

## 3) Scalability Strategy

### Targets (example SLOs)
- API p95 latency < 200 ms under normal load.
- Error rate < 0.5% per 5‑minute window.

### Horizontal Scaling
- **Backend**: Containerized FastAPI behind an ALB/Ingress. Stateless workers enable auto‑scaling on CPU/RPS.  
- **Database**: Start with a primary Postgres instance (Multi‑AZ later). Add read replicas for dashboards/analytics.  
- **Cache**: Add Redis to cache availability responses per (restaurant, date, party_size) with a short TTL (30–60s).

### Static Delivery
- SPA deployed to object storage + CDN (S3 + CloudFront) with long‑lived cache and hash‑based asset invalidation.

### Capacity
- Connection pooling (`pgbouncer` or SQLAlchemy pool).  
- Indices on `(restaurant_id, visit_date, visit_time)`; unique on `booking_reference`.  
- Pagination for list endpoints (e.g., `/Bookings?limit=50&cursor=…`).

### Async
- Offload emails/webhooks/reports to a queue (SQS/Celery/RQ) when needed.

---

## 4) Security Implementation

### Transport & Network
- **TLS everywhere** (CDN/ALB → app).  
- Private subnets for app + DB; public only for CDN/ALB.  
- Security Groups/NACLs with least privilege.

### Auth & Access
- **Owner**: Move from mock token to **OIDC (Auth0/Okta/Cognito)** with short‑lived JWT access tokens and refresh tokens.  
- **Customer**: Public flows by design; managing a booking uses reference + email or a **signed one‑time link** (JWT with limited scope/TTL).

### Input Validation & Abuse Prevention
- Pydantic validation on all inputs.  
- Rate limiting & WAF rules at the edge and API Gateway/ALB.  
- CSRF not applicable for pure token auth + same‑origin SPA; reassess if cookies are introduced.

### Secrets & Data
- Secrets in **AWS Secrets Manager** or **SSM Parameter Store**; never in code.  
- Postgres encryption at rest; encrypted backups; PITR.  
- PII minimization and retention policy (e.g., auto‑purge old bookings).  
- GDPR basics (delete/export) planned if accounts are introduced.

### Web Security Headers
- CORS allow‑list per environment.  
- CSP for SPA to restrict scripts/styles to self + known CDNs.  
- HSTS, X‑Content‑Type‑Options, Referrer‑Policy, etc.

---

## 5) Performance Optimisation

### Database
- **Indexes**:  
  - `bookings(restaurant_id, visit_date, visit_time)`  
  - `availability_slots(restaurant_id, date, time)`  
  - `customers(email)`  
- Avoid N+1 by eager‑loading relations needed for the Dashboard.  
- **Pagination** and selective fields for read endpoints.

### Caching
- **Edge**: CDN for SPA and assets.  
- **App**: Redis for availability responses and frequently viewed bookings. Invalidate cache on create/cancel/update for the affected slot.

### Payloads & Compression
- GZIP/Brotli at the edge.  
- Avoid over‑fetching (customer‑facing endpoints return only necessary fields).

### Front‑end
- Route‑level code splitting; lazy‑load Dashboard.  
- Preload critical fonts (self‑host Playfair Display).  
- Keep long tasks off main thread.

---

## 6) Monitoring & Observability

### Metrics
- **API**: RPS, latency (p50/p90/p95), 4xx/5xx rate by route.  
- **DB**: Connections, slow queries, locks, replica lag.  
- **Infra**: CPU/mem, container restarts, autoscaling events.

### Tracing
- OpenTelemetry in FastAPI (ASGI middleware).  
- Propagate trace headers from the SPA (Axios interceptor).  
- View traces in Jaeger/Tempo or vendor APM.

### Logging
- Structured JSON logs (request id, endpoint, status, latency, user/tenant).  
- Centralized log store (CloudWatch/OpenSearch) with PII scrubbing.

### Alerting
- SLO‑driven alerts (latency, error rate).  
- DB health (connections, storage, replication).  
- Availability of CDN/ALB/TargetGroup.

---

## 7) Cost Analysis (ballpark)

> Costs vary by region/provider—this is an order‑of‑magnitude guide.

**Small prod, low traffic**
- **S3 + CloudFront** (static): ~$5–$20/mo.  
- **FastAPI**: 2× `t4g.small` EC2 behind ALB (~$25–$40/mo compute + ~$18/mo ALB) or 2 small Fargate tasks (~$30–$70/mo).  
- **RDS Postgres db.t4g.micro** (single AZ to start): ~$15–$25/mo + storage.  
- **ElastiCache Redis t4g.micro** (optional early): ~$15–$20/mo.  
- **CloudWatch logs/metrics**: ~$5–$20/mo.

**Optimisations**
- Start single‑AZ; enable Multi‑AZ when required.  
- Scale down off‑hours where acceptable.  
- Use autoscaling with modest mins/maxes.  
- Reserve capacity/savings plans after profiling steady state.

---

## Data Model (summary)

- **Restaurant**(id, name, microsite_name, created_at)  
- **Customer**(id, first_name, surname, email, mobile, marketing flags, created_at)  
- **Booking**(id, booking_reference*, restaurant_id, customer_id, visit_date, visit_time, party_size, channel_code, special_requests, status, cancellation_reason_id?, created_at, updated_at)  
- **AvailabilitySlot**(id, restaurant_id, date, time, max_party_size, available, created_at)  
- **CancellationReason**(id, reason, description)

\* unique 7‑char code.

---

## Key Flows

1. **Availability Search** → Use base slot + count confirmed bookings; compute Available/Full.  
2. **Create Booking** → Validate slot; create/link customer; create booking; occupy slot.  
3. **Update Booking** → If date/time changes, validate new slot; release old and occupy new.  
4. **Cancel Booking** → Mark cancelled with reason; release slot.  
5. **Dashboard** → Owner lists, cancels, and updates inline (token‑gated).

---

## Future Enhancements

- Owner auth via OIDC/JWT and role‑based access control.  
- Customer accounts or secure signed links for self‑service changes.  
- Multi‑restaurant tenancy and granular resource isolation.  
- Richer seating model (areas/tables/overlaps); overbooking/hold logic.  
- Notifications (email/SMS) via queue.  
- Analytics and demand forecasting.

---

*End of document.*
