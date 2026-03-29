import { createContext, useContext, useMemo, useState } from 'react';
import { api, setAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  if (token) {
    setAuthToken(token);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data);
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    setSession(data);
  }

  function setSession(data) {
    setToken(data.token);
    setUser(data.user);
    setAuthToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  function logout() {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
