import React, { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

const AuthRoute: React.FC<{ children: JSX.Element; requireAuth?: boolean }> = ({
  children,
  requireAuth = false,
}) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
          toast.success("Successfully authenticated!");
        } else {
          setIsAuthenticated(false);
          toast.error(response?.data?.message);
        }
      } catch (err: any) {
        setIsAuthenticated(false);
        toast.error(err?.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-start justify-between">
        Loading...
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
