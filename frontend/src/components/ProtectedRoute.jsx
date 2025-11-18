import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, validateToken } = useAuth();

  useEffect(() => {
    // Validate token on component mount
    if (!isAuthenticated && !loading) {
      validateToken();
    }
  }, [isAuthenticated, loading, validateToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
