import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireAuth = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have the required role, redirect to auth page
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default RequireAuth;
