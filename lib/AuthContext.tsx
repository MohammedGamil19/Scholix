'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { EMERGENCY_STORAGE_KEY } from './emergencyAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginEmergency: () => void;
  logoutEmergency: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  loginEmergency: () => {},
  logoutEmergency: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState(false);

  useEffect(() => {
    setEmergency(localStorage.getItem(EMERGENCY_STORAGE_KEY) === 'true');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function loginEmergency() {
    localStorage.setItem(EMERGENCY_STORAGE_KEY, 'true');
    setEmergency(true);
  }

  function logoutEmergency() {
    localStorage.removeItem(EMERGENCY_STORAGE_KEY);
    setEmergency(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user || emergency, loginEmergency, logoutEmergency }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
