import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.data);
    return res.data.data;
  };

  const adminLogin = async (credentials) => {
    const res = await authApi.adminLogin(credentials);
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, adminLogin, register, logout, refreshMe, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
