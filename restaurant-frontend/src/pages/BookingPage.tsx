import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const partySize = searchParams.get('partySize') || ''

  // form state
  const [title, setTitle] = useState('Mr')
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!date || !time || !partySize) navigate('/')
  }, [date, time, partySize, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const form = new URLSearchParams({
        VisitDate: date,
        VisitTime: time,
        PartySize: partySize,
        ChannelCode: 'ONLINE',
        'Customer[Title]': title,
        'Customer[FirstName]': firstName,
        'Customer[Surname]': surname,
        'Customer[Email]': email,
        'Customer[Mobile]': mobile,
        SpecialRequests: specialRequests,
      })
      const res = await api.post('/BookingWithStripeToken', form)
      navigate(`/booking/${res.data.booking_reference}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow">
      {/* Heading + details use same dark purple */}
      <h2 className="text-2xl font-semibold mb-2 text-[var(--hu-ink)]">Confirm Booking</h2>
      <p className="mb-4 text-[var(--hu-ink)] font-medium">
        {date} @ {time} — party {partySize}
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-purple-950">Title</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2 bg-white text-purple-950"
          >
            {['Mr', 'Mrs', 'Ms', 'Dr'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <input
          required
          placeholder="First name"
          className="w-full border rounded p-2 placeholder-gray-600 text-purple-950"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          required
          placeholder="Surname"
          className="w-full border rounded p-2 placeholder-gray-600 text-purple-950"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />

        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2 placeholder-gray-600 text-purple-950"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Mobile"
          className="w-full border rounded p-2 placeholder-gray-600 text-purple-950"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <textarea
          placeholder="Special requests"
          className="w-full border rounded p-2 rows-3 placeholder-gray-600 text-purple-950"
          rows={3}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Booking…' : 'Book Now'}
        </button>
      </form>
    </div>
  )
}
