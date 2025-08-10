import { useEffect, useState } from 'react'
import { api } from '../api/client'

type Reason = { id: number; reason: string; description?: string }

export default function CancelBookingCard({
  restaurantName = 'TheHungryUnicorn',
  bookingRef,
  onCancelled,
}: {
  restaurantName?: string
  bookingRef: string
  onCancelled?: (payload: any) => void
}) {
  const [reasons, setReasons] = useState<Reason[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
  async function loadReasons() {
    try {
      const res = await api.get('/CancellationReasons'); // <-- no restaurantName here
      setReasons(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reasons');
    }
  }
  loadReasons();
    }, []);

  const handleCancel = async () => {
    if (!selectedId) {
        setError('Please choose a reason')
        return
    }
    setError('')
    setLoading(true)
    try {
        const form = new URLSearchParams({
        micrositeName: 'TheHungryUnicorn',          // must match the path restaurant
        bookingReference: bookingRef,
        cancellationReasonId: String(selectedId),
        })

        // ✅ no restaurantName here — baseURL already has it
        const res = await api.post(`/Booking/${bookingRef}/Cancel`, form)
        onCancelled?.(res.data)
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Cancellation failed')
    } finally {
        setLoading(false)
    }
    }

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Cancel this booking</h3>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="space-y-2">
        <label className="block text-sm">Reason</label>
        <select
          className="w-full border rounded p-2"
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          <option value="">Select a reason…</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id}. {r.reason}
            </option>
          ))}
        </select>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          {loading ? 'Cancelling…' : 'Cancel Booking'}
        </button>
      </div>
    </div>
  )
}
