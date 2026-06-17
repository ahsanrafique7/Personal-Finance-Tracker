import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/api';

const AuthContext = createContext(null);

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('pft_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('pft_token');
    if (token) {
      getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('pft_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('pft_token');
          localStorage.removeItem('pft_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('pft_token', token);
    localStorage.setItem('pft_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, tier) => {
    const res = await registerUser({ name, email, password, tier });
    const { token, ...userData } = res.data;
    localStorage.setItem('pft_token', token);
    localStorage.setItem('pft_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pft_token');
    localStorage.removeItem('pft_user');
    setUser(null);
  };

  const refreshUser = (updatedUser) => {
    const userData = { ...updatedUser };
    if (userData.token) {
      localStorage.setItem('pft_token', userData.token);
      delete userData.token;
    }
    setUser(userData);
    localStorage.setItem('pft_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
