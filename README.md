
# Restaurant Booking System for Locai Labs.



This is a full-stack restaurant booking app, with a modern React user interface, and the backend is ran on FastAPI.
This restaurant booking app features live availability, bookings, looking up existing bookings, cancelling a booking, and a proper dashboard that only the owner can access with an API token which features the ability to manage and cancel any booking.

VIDEO DEMONSTRATION:
https://youtu.be/UzXqOMhk83A

## Tech Stack

- **Frontend:** React + TypeScript (Vite), React Router, Axios, Tailwind CSS
- **Backend:** FastAPI (Uvicorn), SQLAlchemy, SQLite (dev)
- **Auth (mock):** Fixed bearer token for owner actions. Customer flows are open.
- **Dev tooling:** ESLint, TypeScript

## Features

- A responsive, unicorn themed home page.
- Step by step booking. The customer checks availability for a given date and party, and is then brought to a page where they can pick an available slot.
- Create a booking (with customer details + special requests)
- View booking by reference; cancel a booking with reason
- Owner login (token) and **Dashboard** with:
  - List of all bookings
  - Cancel booking with reason
  - Modify date/time/party/notes (guards against unavailable slots)
- Availability slots are marked unavailable on booking and restored on cancel

## Run Locally

### 1) Backend (FastAPI)
From the API project root (where `app/` lives):

```bash
# (optional) conda env
conda activate restaurant-booking

# install deps
pip install -r requirements.txt

# run
python -m app
# or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8547
```

FastAPI docs: `http://localhost:8547/docs`

### 2) Frontend (React/Vite)

```bash
cd restaurant-frontend
npm install
npm run dev
# app at http://localhost:5173
```

> If you want to change the backend URL, set `VITE_API_BASE` (see **Config**).

## Config

Frontend uses Axios instance in `src/api/client.ts`:
- `baseURL` defaults to `http://localhost:8547/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn`
- Owner token is stored in `localStorage` as `apiToken` and added to requests when present
- Owner can log in via `/login?token=<BEARER_TOKEN>` or paste the token

## API (high‑level)

Main endpoints used by the UI:

- `POST /{restaurant}/AvailabilitySearch` — check slots
- `POST /{restaurant}/BookingWithStripeToken` — create booking
- `GET  /{restaurant}/Booking/{ref}` — get booking by reference
- `PATCH /{restaurant}/Booking/{ref}` — update booking (owner/admin)
- `POST /{restaurant}/Booking/{ref}/Cancel` — cancel with reason
- `GET  /{restaurant}/Bookings` — list all bookings (owner/admin)
- `GET  /{restaurant}/CancellationReasons` — list cancel reasons

See **API.md** for request/response examples.

## Data Model (dev)

- `restaurants` (id, name, microsite_name, created_at)
- `customers` (contact details + marketing preferences)
- `bookings` (booking_reference, restaurant_id, customer_id, visit_date, visit_time, party_size, status, …)
- `availability_slots` (restaurant_id, date, time, available, max_party_size)
- `cancellation_reasons` (id, reason, description)

Sample data and 30 days of slots are created on first run.

## Project Structure (frontend)

```
src/
  api/client.ts         # axios instance + token helpers
  components/           # Navbar, ProtectedRoute, etc.
  context/AuthContext.tsx
  pages/
    HomePage.tsx
    AvailabilityPage.tsx
    BookingPage.tsx
    LookupPage.tsx
    DetailsPage.tsx
    DashboardPage.tsx   # owner
  index.css             # theme (Playfair headings, unicorn palette)
  App.tsx               # routes
```

## Testing (quick)

- **Manual:** use the included curl examples in **API.md**
- **Backend:** `pytest` with `fastapi.testclient` (sample tests in **TESTING.md**)
- **Frontend:** React Testing Library for components; Playwright/Cypress for E2E happy path

## Production Notes

- Replace SQLite with managed Postgres
- Host API behind an ALB with HTTPS (ACM)
- Deploy frontend to S3 + CloudFront
- Store secrets in AWS Secrets Manager
- Add WAF, rate limiting, logging/metrics/traces

See **ARCHITECTURE.md** and **DEPLOYMENT.md**.
