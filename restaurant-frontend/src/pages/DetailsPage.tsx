import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import CancelBookingCard from '../components/CancelBookingCard'

type Booking = {
  booking_reference: string
  visit_date: string
  visit_time: string
  party_size: number
  status: string
  special_requests?: string
  customer?: { first_name?: string; surname?: string; email?: string }
}

export default function DetailsPage() {
  const { ref } = useParams<{ ref: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // edit state
  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [party, setParty] = useState<number>(2)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!ref) return
    setLoading(true)
    api
      .get(`/Booking/${ref}`)
      .then((res) => {
        setBooking(res.data)
        setError('')
        // prime edit fields from current booking
        setDate(res.data.visit_date ?? '')
        setTime(res.data.visit_time ?? '')
        setParty(res.data.party_size ?? 2)
        setNotes(res.data.special_requests ?? '')
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load booking')
        setTimeout(() => navigate('/lookup'), 1500)
      })
      .finally(() => setLoading(false))
  }, [ref, navigate])

  const handleSave = async () => {
    if (!ref) return
    setSaveError('')
    setSaving(true)
    try {
      const form = new URLSearchParams()
      if (date) form.append('VisitDate', date)
      if (time) form.append('VisitTime', time)
      if (party) form.append('PartySize', String(party))
      form.append('SpecialRequests', notes || '')
      const res = await api.patch(`/Booking/${ref}`, form)
      // refresh details after successful update
      const refreshed = await api.get(`/Booking/${ref}`)
      setBooking(refreshed.data)
      setEditing(false)
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-4">Loading…</p>
  if (!booking) return <p className="p-4 text-red-600">{error || 'Not found'}</p>

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-3 text-[var(--hu-ink)]">
        Booking {booking.booking_reference}
      </h2>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <p className="mb-1 text-[var(--hu-ink)]">
        {booking.visit_date} @ {booking.visit_time} — party {booking.party_size}
      </p>
      <p className="mb-1 text-[var(--hu-ink)]">
        Status: <strong>{booking.status}</strong>
      </p>
      {booking.customer?.email && (
        <p className="mb-4 text-[var(--hu-ink)]">Email: {booking.customer.email}</p>
      )}
      {booking.special_requests && (
        <p className="mb-4 text-[var(--hu-ink)]">Notes: {booking.special_requests}</p>
      )}

      {/* Edit section (only if not cancelled) */}
      {booking.status !== 'cancelled' && (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Modify this booking</h3>
            {!editing ? (
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50"
                onClick={() => setEditing(true)}
              >
                Edit…
              </button>
            ) : (
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50"
                onClick={() => {
                  // reset edits to current booking values
                  setDate(booking.visit_date || '')
                  setTime(booking.visit_time || '')
                  setParty(booking.party_size || 2)
                  setNotes(booking.special_requests || '')
                  setEditing(false)
                  setSaveError('')
                }}
              >
                Close
              </button>
            )}
          </div>

          {editing && (
            <>
              {saveError && (
                <div className="text-red-600 mb-2">{saveError}</div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="border rounded p-2"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  className="border rounded p-2"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  className="border rounded p-2"
                  value={party}
                  onChange={(e) => setParty(Number(e.target.value))}
                />
                <input
                  type="text"
                  placeholder="Special requests"
                  className="border rounded p-2 col-span-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-60"
              >
                {saving ? 'Updating…' : 'Save Changes'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Heads up: if you change the date/time, the system will only allow
                it if that slot is still available.
              </p>
            </>
          )}
        </div>
      )}

      {booking.status !== 'cancelled' ? (
        <CancelBookingCard
          bookingRef={booking.booking_reference}
          onCancelled={(data) => {
            setBooking((prev) => (prev ? { ...prev, status: 'cancelled' } : prev))
            alert(data.message || 'Booking cancelled')
          }}
        />
      ) : (
        <div className="mt-6 p-3 bg-red-50 text-red-700 rounded">
          This booking is already cancelled.
        </div>
      )}
    </div>
  )
}
