import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 border border-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Login
          </button>
        </form>
        <div className="w-full flex justify-end">
          <Link to="/register" className="hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
