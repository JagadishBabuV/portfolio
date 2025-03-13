import React from "react";
import { Link } from "react-router-dom";

const App: React.FC = () => {
  return (
    <div>
      <h1>Welcome to My Fullstack App</h1>
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
    </div>
  );
};

export default App;
