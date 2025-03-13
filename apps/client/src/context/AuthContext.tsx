import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
    try {
      await axios.post("/api/auth/login", { username, password });
      setIsAuthenticated(true);
      navigate("/dashboard");
      toast.success("Successfully authenticated!");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Failed to authenticate!");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {
        credentials: "include",
      });
      setIsAuthenticated(false);
      navigate("/login");
      toast.info("Successfully Logged Out!");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to logged out!");
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await axios.post("/api/auth/register", { username, password });
      navigate("/login");
      toast.success("Successfully registered!");
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Failed to register!");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, register, setIsAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
