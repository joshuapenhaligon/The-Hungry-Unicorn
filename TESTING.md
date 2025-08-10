
# Testing Strategy

## Backend (FastAPI)

### Unit/Integration
- Use `pytest` and `fastapi.testclient`.
- Spin up a test DB (SQLite in memory) and seed minimal data.
- Cover:
  - AvailabilitySearch: correct capacity logic
  - Create booking: customer upsert, unique reference, slot toggle
  - Update booking: rejects cancelled, respects slot availability
  - Cancel booking: reason required, slot restored, idempotence
  - List bookings: requires token
  - Get booking: returns joined customer details

Example:
```python
def test_create_and_cancel_booking(client):
    # create
    r = client.post("/api/.../BookingWithStripeToken", data={...}, headers=AUTH)
    assert r.status_code == 200
    ref = r.json()["booking_reference"]

    # cancel
    c = client.post(f"/api/.../Booking/{ref}/Cancel", data={...}, headers=AUTH)
    assert c.status_code == 200
    assert c.json()["status"] == "cancelled"
```

## Frontend

### Unit
- React Testing Library: form validation, button enable/disable, rendering states.

### E2E
- Playwright/Cypress flows:
  1. Availability → Book → See reference
  2. Lookup → Cancel with reason → Confirm status
  3. Owner: Login (token) → Dashboard list → Edit booking → Verify update
  4. Owner: Cancel from dashboard → Verify slot restored

### Accessibility
- `@axe-core/react` or Playwright accessibility snapshot.
- Keyboard navigation through forms and dialog flows.
