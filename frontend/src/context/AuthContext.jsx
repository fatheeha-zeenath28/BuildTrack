import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('bt_user') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bt_token');
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bt_token', data.token);
    localStorage.setItem('bt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('bt_token', data.token);
    localStorage.setItem('bt_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
