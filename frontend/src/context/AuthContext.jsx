/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists on boot, fetch the user profile or parse it
    if (token) {
      localStorage.setItem('token', token);
      setUser({ email: localStorage.getItem('userEmail') || 'user@test.com' });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (jwtToken, userEmail) => {
    localStorage.setItem('userEmail', userEmail);
    setToken(jwtToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}