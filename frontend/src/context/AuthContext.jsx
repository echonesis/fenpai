import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      return token && user ? { token, user } : null;
    } catch {
      return null;
    }
  });

  function login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  }

  function updateUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    setAuth(prev => ({ ...prev, user }));
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser, isAuthenticated: !!auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
