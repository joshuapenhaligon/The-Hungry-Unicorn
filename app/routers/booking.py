"""
Booking Router for Restaurant Booking API.

This module handles all booking-related operations including creation,
retrieval, updates, and cancellation of restaurant bookings.

Author: AI Assistant
"""

import random
import string
from datetime import date, time, datetime
from typing import Optional

from fastapi import APIRouter, Form, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Restaurant, Customer, Booking, CancellationReason, AvailabilitySlot


router = APIRouter(prefix="/api/ConsumerApi/v1/Restaurant", tags=["booking"])

# Fixed mock bearer token for authentication
MOCK_BEARER_TOKEN = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFwcGVsbGErYXBpQHJlc2"
    "RpYXJ5LmNvbSIsIm5iZiI6MTc1NDQzMDgwNSwiZXhwIjoxNzU0NTE3MjA1LCJpYXQiOjE3NTQ0MzA4"
    "MDUsImlzcyI6IlNlbGYiLCJhdWQiOiJodHRwczovL2FwaS5yZXNkaWFyeS5jb20ifQ.g3yLsufdk8Fn"
    "2094SB3J3XW-KdBc0DY9a2Jiu_56ud8"
)


def verify_token(authorization: str = Header(...)) -> str:
    """
    Verify the bearer token in the Authorization header.

    Args:
        authorization: The Authorization header value

    Returns:
        str: The validated token

    Raises:
        HTTPException: If token is invalid or header format is wrong
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format"
        )

    token = authorization.replace("Bearer ", "")
    if token != MOCK_BEARER_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return token


def generate_booking_reference() -> str:
    """
    Generate a unique 7-character alphanumeric booking reference.

    Returns:
        str: A unique booking reference code
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))


class CustomerData(BaseModel):
    Title: Optional[str] = None
    FirstName: Optional[str] = None
    Surname: Optional[str] = None
    MobileCountryCode: Optional[str] = None
    Mobile: Optional[str] = None
    PhoneCountryCode: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None
    ReceiveEmailMarketing: Optional[bool] = None
    ReceiveSmsMarketing: Optional[bool] = None
    GroupEmailMarketingOptInText: Optional[str] = None
    GroupSmsMarketingOptInText: Optional[str] = None
    ReceiveRestaurantEmailMarketing: Optional[bool] = None
    ReceiveRestaurantSmsMarketing: Optional[bool] = None
    RestaurantEmailMarketingOptInText: Optional[str] = None
    RestaurantSmsMarketingOptInText: Optional[str] = None


@router.post("/{restaurant_name}/BookingWithStripeToken")
async def create_booking_with_stripe(
    restaurant_name: str,
    VisitDate: date = Form(...),
    VisitTime: time = Form(...),
    PartySize: int = Form(...),
    ChannelCode: str = Form(...),
    SpecialRequests: Optional[str] = Form(None),
    IsLeaveTimeConfirmed: Optional[bool] = Form(None),
    RoomNumber: Optional[str] = Form(None),
    # Customer fields
    Title: Optional[str] = Form(None, alias="Customer[Title]"),
    FirstName: Optional[str] = Form(None, alias="Customer[FirstName]"),
    Surname: Optional[str] = Form(None, alias="Customer[Surname]"),
    MobileCountryCode: Optional[str] = Form(None, alias="Customer[MobileCountryCode]"),
    Mobile: Optional[str] = Form(None, alias="Customer[Mobile]"),
    PhoneCountryCode: Optional[str] = Form(None, alias="Customer[PhoneCountryCode]"),
    Phone: Optional[str] = Form(None, alias="Customer[Phone]"),
    Email: Optional[str] = Form(None, alias="Customer[Email]"),
    ReceiveEmailMarketing: Optional[bool] = Form(
        None, alias="Customer[ReceiveEmailMarketing]"
    ),
    ReceiveSmsMarketing: Optional[bool] = Form(
        None, alias="Customer[ReceiveSmsMarketing]"
    ),
    GroupEmailMarketingOptInText: Optional[str] = Form(
        None, alias="Customer[GroupEmailMarketingOptInText]"
    ),
    GroupSmsMarketingOptInText: Optional[str] = Form(
        None, alias="Customer[GroupSmsMarketingOptInText]"
    ),
    ReceiveRestaurantEmailMarketing: Optional[bool] = Form(
        None, alias="Customer[ReceiveRestaurantEmailMarketing]"
    ),
    ReceiveRestaurantSmsMarketing: Optional[bool] = Form(
        None, alias="Customer[ReceiveRestaurantSmsMarketing]"
    ),
    RestaurantEmailMarketingOptInText: Optional[str] = Form(
        None, alias="Customer[RestaurantEmailMarketingOptInText]"
    ),
    RestaurantSmsMarketingOptInText: Optional[str] = Form(
        None, alias="Customer[RestaurantSmsMarketingOptInText]"
    ),
    db: Session = Depends(get_db)
):
    """
    Create a new booking with Stripe payment token
    """
    # Find restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check there is an available slot for this date/time
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.restaurant_id == restaurant.id,
        AvailabilitySlot.date == VisitDate,
        AvailabilitySlot.time == VisitTime,
    ).first()

    if not slot:
        raise HTTPException(status_code=400, detail="No availability slot found for that date/time")
    if not slot.available:
        raise HTTPException(status_code=400, detail="Selected time slot is not available")

    # Create or find customer
    customer = None
    if Email:
        customer = db.query(Customer).filter(Customer.email == Email).first()

    if not customer:
        customer = Customer(
            title=Title,
            first_name=FirstName,
            surname=Surname,
            mobile_country_code=MobileCountryCode,
            mobile=Mobile,
            phone_country_code=PhoneCountryCode,
            phone=Phone,
            email=Email,
            receive_email_marketing=ReceiveEmailMarketing or False,
            receive_sms_marketing=ReceiveSmsMarketing or False,
            group_email_marketing_opt_in_text=GroupEmailMarketingOptInText,
            group_sms_marketing_opt_in_text=GroupSmsMarketingOptInText,
            receive_restaurant_email_marketing=ReceiveRestaurantEmailMarketing or False,
            receive_restaurant_sms_marketing=ReceiveRestaurantSmsMarketing or False,
            restaurant_email_marketing_opt_in_text=RestaurantEmailMarketingOptInText,
            restaurant_sms_marketing_opt_in_text=RestaurantSmsMarketingOptInText
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Generate unique booking reference
    booking_reference = generate_booking_reference()
    while db.query(Booking).filter(
        Booking.booking_reference == booking_reference
    ).first():
        booking_reference = generate_booking_reference()

    # Create booking
    booking = Booking(
        booking_reference=booking_reference,
        restaurant_id=restaurant.id,
        customer_id=customer.id,
        visit_date=VisitDate,
        visit_time=VisitTime,
        party_size=PartySize,
        channel_code=ChannelCode,
        special_requests=SpecialRequests,
        is_leave_time_confirmed=IsLeaveTimeConfirmed or False,
        room_number=RoomNumber,
        status="confirmed"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    #  Mark the slot as taken
    slot.available = False
    db.commit()

    return {
        "booking_reference": booking_reference,
        "booking_id": booking.id,
        "restaurant": restaurant_name,
        "visit_date": VisitDate,
        "visit_time": VisitTime,
        "party_size": PartySize,
        "channel_code": ChannelCode,
        "special_requests": SpecialRequests,
        "is_leave_time_confirmed": IsLeaveTimeConfirmed,
        "room_number": RoomNumber,
        "customer": {
            "id": customer.id,
            "title": customer.title,
            "first_name": customer.first_name,
            "surname": customer.surname,
            "email": customer.email,
            "mobile": customer.mobile
        },
        "status": "confirmed",
        "created_at": booking.created_at
    }


@router.post("/{restaurant_name}/Booking/{booking_reference}/Cancel")
async def cancel_booking(
    restaurant_name: str,
    booking_reference: str,
    micrositeName: str = Form(...),
    bookingReference: str = Form(...),
    cancellationReasonId: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Cancel an existing booking
    """
    # Validate booking reference matches
    if booking_reference != bookingReference:
        raise HTTPException(status_code=400, detail="Booking reference mismatch")

    # Find restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Find booking
    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.restaurant_id == restaurant.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Check if already cancelled
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    # Validate cancellation reason
    cancellation_reason = db.query(CancellationReason).filter(
        CancellationReason.id == cancellationReasonId
    ).first()
    if not cancellation_reason:
        raise HTTPException(status_code=400, detail="Invalid cancellation reason")

    # Update booking status
    booking.status = "cancelled"
    booking.cancellation_reason_id = cancellationReasonId
    booking.updated_at = datetime.utcnow()

    # Free up the slot for that date/time
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.restaurant_id == restaurant.id,
        AvailabilitySlot.date == booking.visit_date,
        AvailabilitySlot.time == booking.visit_time,
    ).first()
    if slot:
        slot.available = True

    db.commit()
    db.refresh(booking)

    return {
        "booking_reference": booking_reference,
        "booking_id": booking.id,
        "restaurant": restaurant_name,
        "microsite_name": micrositeName,
        "cancellation_reason_id": cancellationReasonId,
        "cancellation_reason": cancellation_reason.reason,
        "status": "cancelled",
        "cancelled_at": booking.updated_at,
        "message": f"Booking {booking_reference} has been successfully cancelled"
    }


@router.get("/{restaurant_name}/Booking/{booking_reference}")
async def get_booking(
    restaurant_name: str,
    booking_reference: str,
    db: Session = Depends(get_db)
):
    """
    Get booking details by reference
    """
    # Find restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Find booking with customer data
    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.restaurant_id == restaurant.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Get cancellation reason if cancelled
    cancellation_reason = None
    if booking.status == "cancelled" and booking.cancellation_reason_id:
        reason = db.query(CancellationReason).filter(
            CancellationReason.id == booking.cancellation_reason_id
        ).first()
        if reason:
            cancellation_reason = {
                "id": reason.id,
                "reason": reason.reason,
                "description": reason.description
            }

    return {
        "booking_reference": booking_reference,
        "booking_id": booking.id,
        "restaurant": restaurant_name,
        "visit_date": booking.visit_date,
        "visit_time": booking.visit_time,
        "party_size": booking.party_size,
        "channel_code": booking.channel_code,
        "special_requests": booking.special_requests,
        "is_leave_time_confirmed": booking.is_leave_time_confirmed,
        "room_number": booking.room_number,
        "status": booking.status,
        "customer": {
            "id": booking.customer.id,
            "title": booking.customer.title,
            "first_name": booking.customer.first_name,
            "surname": booking.customer.surname,
            "email": booking.customer.email,
            "mobile": booking.customer.mobile,
            "phone": booking.customer.phone
        },
        "cancellation_reason": cancellation_reason,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at
    }


@router.patch("/{restaurant_name}/Booking/{booking_reference}")
async def update_booking(
    restaurant_name: str,
    booking_reference: str,
    VisitDate: Optional[date] = Form(None),
    VisitTime: Optional[time] = Form(None),
    PartySize: Optional[int] = Form(None),
    SpecialRequests: Optional[str] = Form(None),
    IsLeaveTimeConfirmed: Optional[bool] = Form(None),
    db: Session = Depends(get_db),
    # NOTE: leave token off if customers can edit their booking too; keep it if you want owner-only
    # token: str = Depends(verify_token)
):
    """
    Update an existing booking, enforcing slot availability rules:
      - If date/time changes: target slot must exist AND be available
      - Free old slot if no other confirmed bookings remain on it
      - Mark new slot unavailable
    """
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.restaurant_id == restaurant.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot update cancelled booking")

    # Track updates for response
    updates: dict[str, Any] = {}
    new_date = VisitDate if VisitDate is not None else booking.visit_date
    new_time = VisitTime if VisitTime is not None else booking.visit_time
    new_party = PartySize if PartySize is not None else booking.party_size

    moving_slot = (new_date != booking.visit_date) or (new_time != booking.visit_time)

    # If moving, validate target slot and toggle availability flags
    if moving_slot:
        # Must have a defined target slot
        new_slot = db.query(AvailabilitySlot).filter(
            AvailabilitySlot.restaurant_id == restaurant.id,
            AvailabilitySlot.date == new_date,
            AvailabilitySlot.time == new_time
        ).first()
        if not new_slot:
            raise HTTPException(status_code=404, detail="New time slot not found")

        # Respect capacity: max party size and 'available' flag
        if new_party > new_slot.max_party_size:
            raise HTTPException(status_code=400, detail="Party size exceeds slot capacity")

        # If you allow multiple bookings per slot, you’d check count here.
        # For now, honor the boolean + any existing confirmed bookings rule.
        existing_in_target = db.query(Booking).filter(
            Booking.restaurant_id == restaurant.id,
            Booking.visit_date == new_date,
            Booking.visit_time == new_time,
            Booking.status == "confirmed",
            Booking.id != booking.id
        ).count()

        # With a boolean 'available', block if slot is marked unavailable OR already has any booking
        if not new_slot.available or existing_in_target > 0:
            raise HTTPException(status_code=400, detail="That slot is no longer available")

        # Free old slot if it has no other confirmed bookings
        old_slot = db.query(AvailabilitySlot).filter(
            AvailabilitySlot.restaurant_id == restaurant.id,
            AvailabilitySlot.date == booking.visit_date,
            AvailabilitySlot.time == booking.visit_time
        ).first()
        if old_slot:
            other_on_old = db.query(Booking).filter(
                Booking.restaurant_id == restaurant.id,
                Booking.visit_date == booking.visit_date,
                Booking.visit_time == booking.visit_time,
                Booking.status == "confirmed",
                Booking.id != booking.id
            ).count()
            if other_on_old == 0:
                old_slot.available = True

        # Take the new slot
        new_slot.available = False

    # Apply simple field updates
    if VisitDate is not None and VisitDate != booking.visit_date:
        booking.visit_date = VisitDate
        updates["visit_date"] = VisitDate
    if VisitTime is not None and VisitTime != booking.visit_time:
        booking.visit_time = VisitTime
        updates["visit_time"] = VisitTime
    if PartySize is not None and PartySize != booking.party_size:
        booking.party_size = PartySize
        updates["party_size"] = PartySize
    if SpecialRequests is not None and SpecialRequests != booking.special_requests:
        booking.special_requests = SpecialRequests
        updates["special_requests"] = SpecialRequests
    if (IsLeaveTimeConfirmed is not None
            and IsLeaveTimeConfirmed != booking.is_leave_time_confirmed):
        booking.is_leave_time_confirmed = IsLeaveTimeConfirmed
        updates["is_leave_time_confirmed"] = IsLeaveTimeConfirmed

    if updates:
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)

    return {
        "booking_reference": booking_reference,
        "booking_id": booking.id,
        "restaurant": restaurant_name,
        "updates": updates,
        "status": "updated" if updates else "no_changes",
        "updated_at": booking.updated_at,
        "message": (
            f"Booking {booking_reference} has been "
            f"{'successfully updated' if updates else 'checked - no changes made'}"
        )
    }


@router.get("/{restaurant_name}/Bookings")
async def list_bookings(
    restaurant_name: str,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token),
):
    """
    List bookings for a restaurant (owner dashboard).

    Query params:
      - status: filter by booking status (e.g. "confirmed", "cancelled")
      - date_from, date_to: filter by visit_date range
      - limit/offset: basic pagination
    """
    # Find restaurant
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.name == restaurant_name)
        .first()
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    q = (
        db.query(Booking)
        .filter(Booking.restaurant_id == restaurant.id)
    )

    if status:
        q = q.filter(Booking.status == status)

    if date_from:
        q = q.filter(Booking.visit_date >= date_from)

    if date_to:
        q = q.filter(Booking.visit_date <= date_to)

    q = q.order_by(Booking.visit_date.desc(), Booking.visit_time.desc())

    bookings = q.offset(offset).limit(limit).all()

    # Serialize a compact row for the dashboard table
    return [
        {
            "booking_reference": b.booking_reference,
            "booking_id": b.id,
            "restaurant": restaurant_name,
            "visit_date": b.visit_date,
            "visit_time": b.visit_time,
            "party_size": b.party_size,
            "status": b.status,
            "customer": {
                "id": b.customer.id if b.customer else None,
                "first_name": b.customer.first_name if b.customer else None,
                "surname": b.customer.surname if b.customer else None,
                "email": b.customer.email if b.customer else None,
                "mobile": b.customer.mobile if b.customer else None,
            },
            "created_at": b.created_at,
            "updated_at": b.updated_at,
        }
        for b in bookings
    ]

@router.get("/{restaurant_name}/CancellationReasons")
async def list_cancellation_reasons(
    restaurant_name: str,
    db: Session = Depends(get_db)
):
    # verify restaurant exists (keeps the pattern consistent)
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    reasons = db.query(CancellationReason).order_by(CancellationReason.id).all()
    return [{"id": r.id, "reason": r.reason, "description": r.description} for r in reasons]

@router.post("/{restaurant_name}/Booking/{booking_reference}/Update")
async def update_booking(
    restaurant_name: str,
    booking_reference: str,
    VisitDate: date = Form(...),
    VisitTime: time = Form(...),
    PartySize: int = Form(...),
    SpecialRequests: str = Form(None),
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    # 1. Find restaurant & booking
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.restaurant_id == restaurant.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot update a cancelled booking")

    # 2. If moving to new slot, check availability
    if booking.visit_date != VisitDate or booking.visit_time != VisitTime:
        new_slot = db.query(AvailabilitySlot).filter(
            AvailabilitySlot.restaurant_id == restaurant.id,
            AvailabilitySlot.date == VisitDate,
            AvailabilitySlot.time == VisitTime
        ).first()
        if not new_slot:
            raise HTTPException(status_code=404, detail="New time slot not found")
        if not new_slot.available:
            raise HTTPException(status_code=400, detail="That slot is no longer available")

        # Mark old slot as available (if no other confirmed bookings exist there)
        old_slot = db.query(AvailabilitySlot).filter(
            AvailabilitySlot.restaurant_id == restaurant.id,
            AvailabilitySlot.date == booking.visit_date,
            AvailabilitySlot.time == booking.visit_time
        ).first()
        if old_slot:
            existing_old = db.query(Booking).filter(
                Booking.restaurant_id == restaurant.id,
                Booking.visit_date == booking.visit_date,
                Booking.visit_time == booking.visit_time,
                Booking.status == "confirmed",
                Booking.id != booking.id
            ).count()
            if existing_old == 0:
                old_slot.available = True

        # Mark new slot as taken
        new_slot.available = False

    # 3. Update booking details
    booking.visit_date = VisitDate
    booking.visit_time = VisitTime
    booking.party_size = PartySize
    booking.special_requests = SpecialRequests
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking updated successfully",
        "booking_reference": booking.booking_reference,
        "visit_date": booking.visit_date,
        "visit_time": booking.visit_time,
        "party_size": booking.party_size,
        "special_requests": booking.special_requests
    }
