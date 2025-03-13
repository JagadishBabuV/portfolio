import React from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuthRoute from "./components/AuthRoute";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute requireAuth={true}>
                <Dashboard />
              </AuthRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
    <ToastContainer aria-label={undefined} />
  </React.StrictMode>
);
