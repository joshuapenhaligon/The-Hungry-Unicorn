import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface Slot {
  time: string
  available: boolean
  max_party_size: number
  current_bookings: number
}

export default function AvailabilityPage() {
  const [date, setDate] = useState<string>('')
  const [partySize, setPartySize] = useState<number>(2)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  const fetchSlots = async () => {
    if (!date) {
      setError('Please pick a date first')
      return
    }
    setError('')
    setLoading(true)
    try {
      const form = new URLSearchParams({
        VisitDate: date,
        PartySize: partySize.toString(),
        ChannelCode: 'ONLINE',
      })
      const res = await api.post('/AvailabilitySearch', form)
      setSlots(res.data.available_slots)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = (time: string) => {
    navigate(`/book?date=${date}&time=${time}&partySize=${partySize}`)
  }

  return (
    <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6 text-purple-950">Check Availability</h1>

      {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

      <div className="flex gap-3 mb-6">
        <input
          type="date"
          className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="w-24 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={partySize}
          onChange={(e) => setPartySize(+e.target.value)}
        />
        <button
          onClick={fetchSlots}
          disabled={loading}
          className="px-4 rounded bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {slots.length > 0 && (
        <ul className="space-y-3">
          {slots.map((s) => {
            const rowBase = s.available
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'

            return (
              <li
                key={s.time}
                className={`flex items-center justify-between p-4 rounded-lg shadow-sm ${rowBase}`}
              >
                <div>
                  <div className="font-semibold tracking-wide">{s.time}</div>
                  <div className="text-xs opacity-90">
                    {s.available
                      ? `Up to ${s.max_party_size} • ${s.current_bookings} booked`
                      : 'No seats left'}
                  </div>
                </div>

                {s.available ? (
                  <button
                    onClick={() => handleBook(s.time)}
                    className="px-3 py-1 rounded-full !bg-white !text-green-800 font-semibold hover:!bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Book →
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                    Full
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
