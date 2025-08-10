# The Hungry Unicorn — Restaurant Booking System

End-to-end booking system built on the provided **FastAPI + SQLite** mock server, with a modern **React + TypeScript + Vite + Tailwind** frontend for customers and an owner Dashboard.

This README explains what was added beyond the template, how to run everything, and how to use it.

---

## Contents

- [What’s in this repo](#whats-in-this-repo)
- [Quick start](#quick-start)
- [Frontend overview](#frontend-overview)
- [Backend overview](#backend-overview)
- [Enhancements beyond the template](#enhancements-beyond-the-template)
- [Auth model (mock)](#auth-model-mock)
- [Business rules](#business-rules)
- [API reference (added/changed)](#api-reference-addedchanged)
- [Styling & accessibility](#styling--accessibility)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

---

## What’s in this repo

```
GFDE test/
├── app/                      # FastAPI mock server (provided + enhancements)
│   ├── main.py               # CORS, startup, router include
│   ├── models.py             # Restaurant, Customer, Booking, Slot, Reason
│   ├── routers/
│   │   ├── availability.py   # POST AvailabilitySearch (enhanced logic)
│   │   └── booking.py        # Create, Get, Update, Cancel (+ new list endpoints)
│   └── ...                   # DB config, init script, etc.
├── restaurant-frontend/      # New React + TS + Vite + Tailwind app
│   ├── src/
│   │   ├── api/client.ts     # Axios client (baseURL, optional token)
│   │   ├── components/       # Navbar, ProtectedRoute, etc.
│   │   ├── context/          # AuthContext (owner token)
│   │   └── pages/            # Home, Availability, Booking, Lookup, Details, Dashboard, Login
│   └── ...
└── restaurant_booking.db     # SQLite DB (auto-created)
```

---

## Quick start

### Backend (FastAPI)

```bash
# From repo root (where app/ lives)
# I personally did this in a virtual environment using Anaconda, Python = 3.11

pip install -r requirements.txt

# Start the API (port 8547)
python -m app
# or:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8547
```

Docs:
- Swagger: http://localhost:8547/docs
- ReDoc:  http://localhost:8547/redoc

> The DB and sample data (restaurant, 30 days of slots, 5 cancellation reasons) initialize automatically on first run.

### Frontend (React)

```bash
cd restaurant-frontend
npm install
npm run dev
```

Open: http://localhost:5173

If your API is not on `8547`, update `src/api/client.ts` `baseURL`.

---

## Frontend overview

Customer-facing:
- **Home**: Hero + info, responsive unicorn theme.
- **Availability**: choose date & party size; see colored slot list (Available/Full).
- **Booking**: confirm date/time/party; enter name/email/mobile + special requests; create booking.
- **Manage My Booking**: enter reference → view details → cancel (with reason) or edit (if allowed).

Owner Dashboard (token required):
- **Dashboard**: list all bookings; cancel (choose reason) or edit date/time/party/notes in-line.

Routing:
```
/                       Home
/availability           Availability search
/book                   Create booking (requires query params)
/lookup                 Booking lookup by reference
/booking/:ref           Booking details (edit/cancel)
/login                  Owner login (paste token or magic link)
/dashboard              Owner dashboard (protected)
```

---

## Backend overview

The provided FastAPI mock server was extended to support the frontend:

- **AvailabilitySearch** now checks live bookings per slot.
- **Create/Update/Cancel** bookings adjust the related slot availability.
- **New endpoints** for owner Dashboard: list bookings and list cancellation reasons.
- **CORS** configured for `http://localhost:5173`.

---

## Enhancements beyond the template

**New endpoints**
- `GET /api/ConsumerApi/v1/Restaurant/{restaurant_name}/Bookings`  
  → Returns all bookings (owner/Dashboard).
- `GET /api/ConsumerApi/v1/Restaurant/{restaurant_name}/CancellationReasons`  
  → Returns the 5 predefined cancellation reasons.

**Changed behavior**
- `POST AvailabilitySearch`  
  → Combines base slot availability with current confirmed booking count to compute “Available/Full”.
- `POST BookingWithStripeToken`  
  → Validates target slot availability first; creates/links `Customer`; **occupies** the slot.
- `PATCH Booking/{ref}`  
  → Edits date/time/party/notes. **Releases** the old slot and **occupies** the new slot if date/time changed (only if the new slot has capacity). Rejects updates to cancelled bookings.
- `POST Booking/{ref}/Cancel`  
  → Stores a `cancellationReasonId`, marks booking cancelled, **releases** the slot.

**Frontend (new)**
- Full React app with Tailwind styling and responsive design.
- Token login page with **magic link** support: `/login?token=<BEARER_TOKEN>`.
- Protected Dashboard route and Navbar that reacts to auth state.

---

## Auth model (mock)

- **Public (no token):** Availability search, booking creation, booking lookup/details.
- **Owner only (token required):** List all bookings, cancel booking (via dashboard), update booking.

Token header:
```
Authorization: Bearer <token>
```

For quick testing you can use the mock token already present in the template README, or log in via magic link:

```
http://localhost:5173/login?token=<PASTE_MOCK_TOKEN_HERE>
```

> Token is stored in `localStorage` as `apiToken`. Clear it to simulate customer view.

---

## Business rules

- **Capacity per slot:** A slot is available if the base slot is marked available **and** confirmed bookings for that date/time are below a (mock) capacity threshold.
- **On create:** Occupies the slot.
- **On cancel:** Releases the slot (becomes available again if below capacity).
- **On update:**  
  - Not allowed for cancelled bookings.  
  - If moving to a new date/time: checks availability for the new slot, then releases the old slot and occupies the new one.  
- **Unique references:** 7-char alphanumerics, collision-checked.

---

## API reference (added/changed)

### List bookings (owner)
```
GET /api/ConsumerApi/v1/Restaurant/{restaurant_name}/Bookings
Auth: Bearer token
200: [ { booking_reference, visit_date, visit_time, party_size, status, customer, ... } ]
```

### Cancellation reasons (owner)
```
GET /api/ConsumerApi/v1/Restaurant/{restaurant_name}/CancellationReasons
Auth: Bearer token
200: [ { id, reason, description } ]
```

### Availability search (public)
```
POST /api/ConsumerApi/v1/Restaurant/{restaurant_name}/AvailabilitySearch
Form: VisitDate, PartySize, ChannelCode
200: { available_slots: [ { time, available, max_party_size, current_bookings } ], ... }
```

### Create booking (public)
```
POST /api/ConsumerApi/v1/Restaurant/{restaurant_name}/BookingWithStripeToken
Form: VisitDate, VisitTime, PartySize, ChannelCode, Customer[...] , SpecialRequests?
- Validates slot availability
- Creates/links customer, saves booking, occupies slot
```

### Get booking by reference (public)
```
GET /api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/{booking_reference}
200: full details incl. customer & timestamps (and cancellation info if applicable)
```

### Update booking (owner)
```
PATCH /api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/{booking_reference}
Auth: Bearer token
Form (optional): VisitDate, VisitTime, PartySize, SpecialRequests, IsLeaveTimeConfirmed
- If date/time changes: requires new slot availability, releases old, occupies new
```

### Cancel booking (owner)
```
POST /api/ConsumerApi/v1/Restaurant/{restaurant_name}/Booking/{booking_reference}/Cancel
Auth: Bearer token
Form: micrositeName, bookingReference, cancellationReasonId
- Marks cancelled, stores reason, releases slot
```

---

## Styling & accessibility

- **Tailwind CSS** with a unicorn palette; headings use **Playfair Display** via Google Fonts.
- Adjusted contrast for:
  - Navbar links (dark by default; clear on hover).
  - CTAs (e.g., “Manage My Booking”) to pass contrast against soft backgrounds.
  - Availability list: green/red badges with white/dark text for readability.
  - Details/Booking pages: descriptions use dark purple, not white, to avoid blending.

---

## Troubleshooting

- **CORS error / Dashboard not loading:**  
  Ensure API is on **http://localhost:8547** and `main.py` CORS allows `http://localhost:5173`. If the API starts on a different port (e.g., 8000), either move it to 8547 or update `src/api/client.ts` `baseURL`.

- **422 “authorization missing” on first Dashboard visit:**  
  Make sure you’re logged in (token in localStorage) or use `/login?token=...`. The Dashboard sends the `Authorization` header when `token` is present.

- **Node version warnings:**  
  Vite 7 recommends Node **≥ 20.19**. If you see engine warnings, upgrade Node.

---

## Known limitations

- Payments are mocked (no Stripe).
- Capacity logic is intentionally simple for demo purposes.
- Public cancellation via customer link is not exposed at the API level (Dashboard handles cancellations). In production you’d use signed, per-booking links or authenticated customer accounts.
- SQLite for dev; move to Postgres/MySQL for production with migrations.

---

### Run commands (copy/paste)

**Backend**
```bash
python -m app
# or:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8547
```

**Frontend**
```bash
cd restaurant-frontend
npm install
npm run dev
```
