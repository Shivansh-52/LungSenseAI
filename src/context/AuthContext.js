import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  saveAuthToken,
  loadAuthToken,
  clearAllAuthData,
  saveUserData,
  loadUserData,
} from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // On mount: check for saved token and validate it
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const savedToken = await loadAuthToken();
        if (savedToken) {
          api.setAuthToken(savedToken);
          const userData = await api.getMe();
          if (userData && userData.user) {
            setUser(userData.user);
            setToken(savedToken);
          } else {
            // Token invalid — clear
            await clearAllAuthData();
            api.setAuthToken(null);
          }
        }
      } catch (err) {
        console.warn('Auth bootstrap failed:', err);
        await clearAllAuthData();
        api.setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password);
    if (result.access_token) {
      await saveAuthToken(result.access_token);
      await saveUserData(result.user);
      api.setAuthToken(result.access_token);
      setToken(result.access_token);
      setUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(async (fullName, email, password, confirmPassword) => {
    const result = await api.register(fullName, email, password, confirmPassword);
    if (result.access_token) {
      await saveAuthToken(result.access_token);
      await saveUserData(result.user);
      api.setAuthToken(result.access_token);
      setToken(result.access_token);
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore logout errors
    }
    await clearAllAuthData();
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      if (userData && userData.user) {
        setUser(userData.user);
        await saveUserData(userData.user);
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
