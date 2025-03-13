import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const auth = useAuth();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordRules({
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    });

    return (
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    );
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      return;
    }
    auth.register(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 border border-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
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
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-black rounded"
            />
            <ul className="mt-2">
              <li
                className={
                  passwordRules.minLength ? "text-green-500" : "text-red-500"
                }
              >
                Password must be at least 8 characters long.
              </li>
              <li
                className={
                  passwordRules.hasUpperCase ? "text-green-500" : "text-red-500"
                }
              >
                Password must contain at least one uppercase letter.
              </li>
              <li
                className={
                  passwordRules.hasLowerCase ? "text-green-500" : "text-red-500"
                }
              >
                Password must contain at least one lowercase letter.
              </li>
              <li
                className={
                  passwordRules.hasNumber ? "text-green-500" : "text-red-500"
                }
              >
                Password must contain at least one number.
              </li>
              <li
                className={
                  passwordRules.hasSpecialChar
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                Password must contain at least one special character.
              </li>
            </ul>
          </div>
          <button
            disabled={
              Object.values(passwordRules).some((val) => !val) || !username
            }
            type="submit"
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-25 disabled:pointer-events-none"
          >
            Register
          </button>
        </form>
        <div className="w-full flex justify-end">
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
