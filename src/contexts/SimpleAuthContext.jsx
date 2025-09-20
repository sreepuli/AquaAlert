import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log("Simple AuthProvider is initializing...");

  // Mock functions for testing
  const signup = async (email, password, role, additionalData = {}) => {
    console.log("Mock signup called");
    return { success: true, user: { email, role } };
  };

  const login = async (email, password) => {
    console.log("Mock login called");
    return { success: true, user: { email, role: "community" } };
  };

  const logout = async () => {
    console.log("Mock logout called");
    setUser(null);
    return { success: true };
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
