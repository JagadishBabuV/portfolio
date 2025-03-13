import React, { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios, { AxiosError } from "axios";

const AuthRoute: React.FC<{ children: JSX.Element; requireAuth?: boolean }> = ({
  children,
  requireAuth = false,
}) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/api/auth/verify");
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        if (!requireAuth) return;
        const error = err as Error | AxiosError;
        if (!axios.isAxiosError(error)) {
          toast.error("Something went Wrong");
          return;
        }
        toast.error(error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, setIsAuthenticated]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-2xl">
        Loading...Please wait
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AuthRoute;
