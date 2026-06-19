import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lri_token');
    const username = localStorage.getItem('lri_user');
    if (token && username) {
      authApi
        .verify()
        .then(() => setUser({ token, username }))
        .catch(() => {
          localStorage.removeItem('lri_token');
          localStorage.removeItem('lri_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const { token, username: name } = await authApi.login(username, password);
    localStorage.setItem('lri_token', token);
    localStorage.setItem('lri_user', name);
    setUser({ token, username: name });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem('lri_token');
    localStorage.removeItem('lri_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
