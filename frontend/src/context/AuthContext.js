import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = storageService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (username, password) => {
    const users = storageService.getUsers();
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username };
      setUser(userData);
      storageService.setCurrentUser(userData);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid username or password' };
  };

  const register = (username, password) => {
    const users = storageService.getUsers();
    
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password, // In production, this should be hashed
    };
    
    storageService.addUser(newUser);
    const userData = { id: newUser.id, username: newUser.username };
    setUser(userData);
    storageService.setCurrentUser(userData);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storageService.clearCurrentUser();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

