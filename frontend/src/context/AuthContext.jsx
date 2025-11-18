import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set up axios interceptor to add token to requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Verify token and load user data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, industry, description) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/signup",
        {
          name,
          email,
          password,
          industry,
          description,
        }
      );

      const { access_token, business_id, name: businessName } = response.data;

      // Store token and update axios headers BEFORE setting user
      localStorage.setItem("token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Set user data
      setUser({
        business_id,
        email,
        name: businessName,
        industry,
        has_completed_metrics: false,
      });
      setLoading(false);

      return { success: true, business_id };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.detail || "Signup failed",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { access_token, business_id, name } = response.data;

      // Store token and update axios headers BEFORE calling verifyToken
      localStorage.setItem("token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Now verify token with headers already set
      try {
        const userResponse = await axios.get(
          "http://localhost:8000/api/auth/me"
        );
        setUser(userResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Token verification failed:", error);
        logout();
        return { success: false, error: "Failed to load user data" };
      }

      return { success: true, business_id };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const markMetricsCompleted = async () => {
    if (user && user.business_id) {
      try {
        await axios.post(
          `http://localhost:8000/api/auth/complete-metrics/${user.business_id}`
        );
        setUser({ ...user, has_completed_metrics: true });
      } catch (error) {
        console.error("Failed to mark metrics as completed:", error);
      }
    }
  };

  const validateToken = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Token validation failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    markMetricsCompleted,
    isAuthenticated: !!user,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
