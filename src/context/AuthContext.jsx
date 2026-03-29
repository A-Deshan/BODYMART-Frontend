import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../services/api.js';
import { loginStoreAccount, registerStoreAccount } from '../services/storeApi.js';

const TOKEN_STORAGE_KEY = 'websiteToken';
const USER_STORAGE_KEY = 'websiteUser';
const AuthContext = createContext(null);

function loadStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(loadStoredUser);

  useEffect(() => {
    setAuthToken(token || null);
  }, [token]);

  async function login(email, password) {
    const data = await loginStoreAccount({ email, password });
    setSession(data);
  }

  async function register(payload) {
    const data = await registerStoreAccount(payload);
    setSession(data);
  }

  function setSession(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  }

  function logout() {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
