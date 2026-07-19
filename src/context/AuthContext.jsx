import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const saved = localStorage.getItem('user');
      if (!token || !saved) {
        localStorage.removeItem('user');
        return null;
      }
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      return;
    }

    // Re-hydrate full profile (addresses/payments) after reload
    userService
      .getMe()
      .then(({ data }) => {
        const userData = data.user || data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        // Interceptor handles redirect on hard auth failure
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const sendOtp = useCallback(async (phone) => {
    const { data } = await authService.sendOtp(phone);
    return data;
  }, []);

  const verifyOtp = useCallback(async (phone, otp, sessionId, name, quizContext) => {
    const { data } = await authService.verifyOtp(phone, otp, sessionId, name, quizContext);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const { data } = await userService.updateMe(profileData);
    const userData = data.user || data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userService.getMe();
      const userData = data.user || data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, []);

  const setUserAddresses = useCallback((addresses) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, addresses: addresses || [] };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        sendOtp,
        verifyOtp,
        updateProfile,
        logout,
        refreshUser,
        setUserAddresses,
        loading,
        isAuthenticated: !!user && hasToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
