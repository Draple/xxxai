import { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('xxxai_token'));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetch(`${API}/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('xxxai_token');
        setToken(null);
        setUser(null);
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    localStorage.setItem('xxxai_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Error al registrarse');
      err.status = res.status;
      throw err;
    }
    localStorage.setItem('xxxai_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const oauthLogin = async (provider, providerId, email) => {
    const res = await fetch(`${API}/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, providerId, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error OAuth');
    localStorage.setItem('xxxai_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('xxxai_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    const res = await fetch(`${API}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUser(await res.json());
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, oauthLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
