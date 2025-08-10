
# API Specification (Used by the UI)

> This is the minimal API surface used by the React app. Paths are relative to:
> `/api/ConsumerApi/v1/Restaurant/{restaurant_name}` where `{restaurant_name}` is `TheHungryUnicorn` in dev.

All POST/PATCH use `application/x-www-form-urlencoded`.

## Availability

**POST** `/{restaurant}/AvailabilitySearch`

Form:
- `VisitDate` (YYYY-MM-DD) — required
- `PartySize` (int) — required
- `ChannelCode` (e.g., ONLINE) — required

Response:
```json
{
  "restaurant": "TheHungryUnicorn",
  "visit_date": "2025-08-15",
  "party_size": 2,
  "available_slots": [
    {"time":"12:00:00","available":true,"max_party_size":8,"current_bookings":0}
  ],
  "total_slots": 8
}
```

## Create Booking

**POST** `/{restaurant}/BookingWithStripeToken`

Form (required):
- `VisitDate` (YYYY-MM-DD), `VisitTime` (HH:MM:SS), `PartySize` (int), `ChannelCode`

Customer fields (subset):
- `Customer[Title]`, `Customer[FirstName]`, `Customer[Surname]`, `Customer[Email]`, `Customer[Mobile]`
- `SpecialRequests` (text, optional)

Response:
```json
{
  "booking_reference":"ABC1234",
  "booking_id":1,
  "status":"confirmed",
  "customer": { "first_name":"Alice", "surname":"Jones", "email":"alice@example.com" },
  "visit_date":"2025-08-15", "visit_time":"12:30:00", "party_size":4
}
```

## Get Booking

**GET** `/{restaurant}/Booking/{booking_reference}`

Response includes booking details + customer snippet.

## Update Booking (owner/admin)

**PATCH** `/{restaurant}/Booking/{booking_reference}`

Form (send only what you change):
- `VisitDate`, `VisitTime`, `PartySize`, `SpecialRequests`, `IsLeaveTimeConfirmed`

Response:
```json
{
  "booking_reference":"ABC1234",
  "status":"updated",
  "updated_at":"2025-08-06T11:30:00.123456",
  "updates": { "party_size": 6 }
}
```

Business rules implemented:
- Disallow updates to cancelled bookings
- When changing date/time:
  - Old slot is released if it becomes empty
  - New slot must be available; otherwise `400 Bad Request`

## Cancel Booking

**POST** `/{restaurant}/Booking/{booking_reference}/Cancel`

Form:
- `micrositeName` (string)
- `bookingReference` (string, must match path)
- `cancellationReasonId` (1..5)

Response:
```json
{
  "status":"cancelled",
  "cancellation_reason":"Customer Request",
  "cancelled_at":"2025-08-06T12:30:00.123456"
}
```

## List Bookings (owner/admin)

**GET** `/{restaurant}/Bookings` → Array of booking rows.

## Cancellation Reasons

**GET** `/{restaurant}/CancellationReasons` → Array of `{ id, reason, description }`.

## Auth

- Mock Bearer token in `Authorization: Bearer <token>`.
- Owner flows (list bookings, etc.) require token.
- Customer flows are open in the mock demo (configure as needed for production).
