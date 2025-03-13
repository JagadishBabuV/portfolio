import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="py-2 px-4 border rounded-md focus:outline-none focus:ring cursor-pointer"
        >
          Logout
        </button>
      </header>
      <main className="flex-grow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">Widget 1</div>
          <div className="p-4 border rounded-md">Widget 2</div>
          <div className="p-4 border rounded-md">Widget 3</div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
