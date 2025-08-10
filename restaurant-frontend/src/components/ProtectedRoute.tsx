import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('apiToken');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow for animation or AuthContext loading
    const t = setTimeout(() => setChecking(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
        <div className="text-4xl animate-bounce">🦄</div>
        <p className="mt-4 text-lg text-purple-800 font-medium">
          Checking your magic token...
        </p>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
