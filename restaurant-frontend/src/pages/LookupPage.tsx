import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LookupPage() {
  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.get(`/Booking/${ref.trim()}`);
      const serverEmail = res.data?.customer?.email || '';
      if (serverEmail.toLowerCase() !== email.trim().toLowerCase()) {
        setError('Booking not found for that email.');
        return;
      }
      navigate(`/booking/${ref.trim()}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lookup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Find Your Booking</h1>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Booking reference (e.g. ABC1234)"
          value={ref}
          onChange={e => setRef(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email used for the booking"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
          Lookup
        </button>
      </form>
    </div>
  );
}
