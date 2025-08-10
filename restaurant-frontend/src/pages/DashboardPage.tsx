import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type BookingRow = {
  booking_reference: string;
  booking_id: number;
  restaurant: string;
  visit_date: string;
  visit_time: string;
  party_size: number;
  status: string;
  special_requests?: string;
  customer?: { first_name?: string; surname?: string; email?: string; mobile?: string };
  created_at?: string;
  updated_at?: string;
};

type Reason = { id: number; reason: string; description?: string };

export default function DashboardPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<Record<string, number | ''>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ date: string; time: string; party: number; notes: string }>({
    date: '', time: '', party: 2, notes: '',
  });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get('/Bookings', { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled) { setBookings(res.data); setError(null); }
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        if (!cancelled) setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await api.get('/CancellationReasons', { headers: { Authorization: `Bearer ${token}` } });
        setReasons(res.data);
      } catch { /* ignore */ }
    })();
  }, [token]);

  const handleCancel = async (ref: string) => {
    const reasonId = selectedReason[ref];
    if (!reasonId) { alert('Please choose a cancellation reason first.'); return; }
    setSubmitting(ref);
    try {
      const form = new URLSearchParams({
        micrositeName: 'TheHungryUnicorn',
        bookingReference: ref,
        cancellationReasonId: String(reasonId),
      });
      const res = await api.post(`/Booking/${ref}/Cancel`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev =>
        prev.map(b => b.booking_reference === ref
          ? { ...b, status: 'cancelled', updated_at: res.data.cancelled_at }
          : b));
      setOpenRow(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cancellation failed');
    } finally {
      setSubmitting(null);
    }
  };

  const handleUpdate = async (ref: string) => {
    try {
      const form = new URLSearchParams();
      if (edit.date) form.append('VisitDate', edit.date);
      if (edit.time) form.append('VisitTime', edit.time);
      if (edit.party) form.append('PartySize', String(edit.party));
      form.append('SpecialRequests', edit.notes);

      const res = await api.patch(`/Booking/${ref}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(prev =>
        prev.map(b =>
          b.booking_reference === ref
            ? {
                ...b,
                visit_date: edit.date || b.visit_date,
                visit_time: edit.time || b.visit_time,
                party_size: edit.party || b.party_size,
                special_requests: edit.notes,
                updated_at: res.data.updated_at,
              }
            : b
        )
      );
      setEditingRef(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Update failed');
    }
  };

  if (!token) return <p className="p-4">Authorizing…</p>;
  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-4 text-purple-950">All Bookings</h1>

      <div className="overflow-x-auto rounded-xl border border-purple-300/20 shadow-lg bg-purple-950">
        <table className="w-full text-sm">
          {/* Header: dark bg + white text */}
          <thead className="bg-purple-800 text-white uppercase text-xs tracking-wide">
            <tr>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Party</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          {/* Body: dark rows + white text */}
          <tbody className="divide-y divide-white/10">
            {bookings.map(b => (
              <tr key={b.booking_reference} className="even:bg-purple-900/60 text-white">
                <td className="p-3 font-mono">{b.booking_reference}</td>
                <td className="p-3">
                  <div className="font-medium">
                    {b.customer?.first_name} {b.customer?.surname}
                  </div>
                  <div className="text-white/70 text-xs">{b.customer?.email}</div>
                </td>
                <td className="p-3">{b.visit_date}</td>
                <td className="p-3">{b.visit_time}</td>
                <td className="p-3">{b.party_size}</td>

                {/* Keep red/green theme unchanged */}
                <td className="p-3">
                  <span className={b.status === 'cancelled' ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                    {b.status}
                  </span>
                </td>

                <td className="p-3">
                  {b.status !== 'cancelled' ? (
                    <div className="space-y-3">
                      {/* Cancel toggle */}
                      <button
                        className="px-3 py-1 rounded border border-white/30 text-white hover:bg-white/10"
                        onClick={() => setOpenRow(openRow === b.booking_reference ? null : b.booking_reference)}
                      >
                        {openRow === b.booking_reference ? 'Hide' : 'Cancel…'}
                      </button>

                      {openRow === b.booking_reference && (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className="border border-white/25 bg-white/10 text-white rounded p-1"
                            value={selectedReason[b.booking_reference] ?? ''}
                            onChange={(e) =>
                              setSelectedReason(prev => ({ ...prev, [b.booking_reference]: Number(e.target.value) }))
                            }
                          >
                            <option value="" className="text-black">Select reason…</option>
                            {reasons.map(r => (
                              <option key={r.id} value={r.id} className="text-black">
                                {r.id}. {r.reason}
                              </option>
                            ))}
                          </select>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                            disabled={submitting === b.booking_reference}
                            onClick={() => handleCancel(b.booking_reference)}
                          >
                            {submitting === b.booking_reference ? 'Cancelling…' : 'Confirm'}
                          </button>
                        </div>
                      )}

                      {/* Edit */}
                      <button
                        className="px-3 py-1 rounded border border-white/30 text-white hover:bg-white/10"
                        onClick={() => {
                          setEditingRef(b.booking_reference);
                          setEdit({
                            date: b.visit_date,
                            time: b.visit_time,
                            party: b.party_size,
                            notes: b.special_requests || '',
                          });
                        }}
                      >
                        Edit…
                      </button>

                      {editingRef === b.booking_reference && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          <input
                            type="date"
                            className="border border-white/25 bg-white/10 text-white rounded p-1"
                            value={edit.date}
                            onChange={(e) => setEdit(s => ({ ...s, date: e.target.value }))}
                          />
                          <input
                            type="time"
                            className="border border-white/25 bg-white/10 text-white rounded p-1"
                            value={edit.time}
                            onChange={(e) => setEdit(s => ({ ...s, time: e.target.value }))}
                          />
                          <input
                            type="number"
                            min={1}
                            className="border border-white/25 bg-white/10 text-white rounded p-1"
                            value={edit.party}
                            onChange={(e) => setEdit(s => ({ ...s, party: Number(e.target.value) }))}
                          />
                          <input
                            type="text"
                            placeholder="Special requests"
                            className="border border-white/25 bg-white/10 text-white placeholder-white/60 rounded p-1 col-span-4"
                            value={edit.notes}
                            onChange={(e) => setEdit(s => ({ ...s, notes: e.target.value }))}
                          />
                          <div className="col-span-4 flex gap-2">
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              onClick={() => handleUpdate(b.booking_reference)}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 rounded border border-white/30 text-white hover:bg-white/10"
                              onClick={() => setEditingRef(null)}
                            >
                              Hide
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-white/60">—</span>
                  )}
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr className="text-white">
                <td className="p-6 text-center text-white/80" colSpan={7}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
