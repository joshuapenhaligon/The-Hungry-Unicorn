// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setToken as setApiToken, clearToken as clearApiToken } from '../api/client';

type AuthContextType = {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ token: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('apiToken');
    if (saved) {
      setApiToken(saved);   // <-- ensure axios gets it on refresh
      setToken(saved);
    }
  }, []);

  const login = (t: string) => {
    setApiToken(t);         // <-- sets axios.defaults + localStorage
    setToken(t);            // <-- updates navbar / consumers immediately
  };

  const logout = () => {
    clearApiToken();        // <-- clears axios.defaults + localStorage
    setToken(null);
  };

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
