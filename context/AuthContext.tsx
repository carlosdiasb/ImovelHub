import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/mockApi';

type StrippedUser = Omit<User, 'password'>;

interface AuthContextType {
  user: StrippedUser | null;
  isLoading: boolean; // For login/register/reset actions
  isInitializing: boolean; // For initial localStorage check
  login: (email: string, pass: string) => Promise<{ user: StrippedUser | null; error: string | null }>;
  register: (name: string, email: string, pass: string, accountType: 'particular' | 'corretor' | 'imobiliaria') => Promise<{ user: StrippedUser | null; error: string | null }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean }>;
  updateUser: (data: Partial<StrippedUser>) => Promise<{ user: StrippedUser | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StrippedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For actions like login/register
  const [isInitializing, setIsInitializing] = useState(true); // For the initial check of storage

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
    setIsInitializing(false); // Finished checking storage
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    const { user: loggedUser, error } = await api.login(email, pass);
    if (loggedUser) {
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    }
    setIsLoading(false);
    return { user: loggedUser, error };
  };

  const register = async (name: string, email: string, pass: string, accountType: 'particular' | 'corretor' | 'imobiliaria') => {
    setIsLoading(true);
    const { user: newUser, error } = await api.register(name, email, pass, accountType);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
    setIsLoading(false);
    return { user: newUser, error };
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    const result = await api.requestPasswordReset(email);
    setIsLoading(false);
    return result;
  }
  
  const updateUser = async (data: Partial<StrippedUser>) => {
    if (!user) {
        return { user: null, error: 'Usuário não autenticado.' };
    }
    setIsLoading(true);
    // In a real app, this would be a dedicated endpoint for updating the current user's profile
    const updatedUserData = await api.updateUser(user.id, data);
    if (updatedUserData) {
        // We need to merge because api.updateUser might only return the changed fields.
        const mergedUser = { ...user, ...updatedUserData };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setIsLoading(false);
        return { user: mergedUser, error: null };
    }
    setIsLoading(false);
    return { user: null, error: 'Falha ao atualizar dados.' };
};


  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, login, register, logout, requestPasswordReset, updateUser }}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};