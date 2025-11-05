import React, { createContext, useContext } from 'react';

// 1. Створення об'єкту контексту
export const AuthContext = createContext({
  userToken: null,
  userRole: null, // Роль: 'admin' або 'personnel'
  signIn: () => {},
  signOut: () => {},
});

// 2. Створення кастомного хука для зручного використання
export const useAuth = () => {
  return useContext(AuthContext);
};