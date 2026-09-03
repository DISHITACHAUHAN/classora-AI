import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('classora_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          localStorage.removeItem('classora_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('classora_token', res.access_token);
    setUser({
      id: res.user_id,
      name: res.name,
      email: res.email,
      role: res.role,
      teacher_id: res.teacher_id,
      student_id: res.student_id
    });
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('classora_token', res.access_token);
    setUser({
      id: res.user_id,
      name: res.name,
      email: res.email,
      role: res.role,
      teacher_id: res.teacher_id,
      student_id: res.student_id
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem('classora_token');
    setUser(null);
  };

  // 1-Click Demo Accounts for Judges
  const loginAsDemoTeacher = async () => {
    return login('teacher@classora.ai', 'teacher123');
  };

  const loginAsDemoStudent = async (student = 'rahul') => {
    const email = `${student.toLowerCase()}@classora.ai`;
    return login(email, 'student123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginAsDemoTeacher,
        loginAsDemoStudent
      }}
    >
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
