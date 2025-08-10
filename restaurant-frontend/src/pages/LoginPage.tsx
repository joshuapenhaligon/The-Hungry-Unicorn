import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setToken } from '../api/client'

export default function LoginPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [autoLoggingIn, setAutoLoggingIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      login(urlToken);
      navigate('/dashboard', { replace: true });
      return;
    }

    if (token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setAutoLoggingIn(false);
  }, [location, navigate, token, login]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(tokenInput); // uses AuthContext so navbar updates instantly
    navigate('/dashboard', { replace: true });
  };

  if (autoLoggingIn) {
    return <div className="p-6">Checking for login token…</div>;
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Owner Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Paste API token here"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
