import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
    } catch { logout(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) fetchMe();
    else setLoading(false);
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await API.post('/auth/register', form);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = (notify = true) => {
    localStorage.removeItem('token');
    setUser(null);
    if (notify) toast.success('Logged out');
  };

  const refresh = () => fetchMe();

  const activeMembership = user?.societies?.find(
    s => s.societyId?.toString() === user?.activeSocietyId?.toString()
  );
  const role = activeMembership?.role;

  const switchSociety = async (societyId) => {
    await API.put('/auth/switch-society', { societyId });
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, activeMembership, role, switchSociety }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
