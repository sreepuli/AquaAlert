import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select your role.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("userRole", role);
      if (role === "asha") navigate("/asha-dashboard");
      else if (role === "community") navigate("/community-dashboard");
      else if (role === "official") navigate("/official-dashboard");
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="w-full px-3 py-2 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="asha">ASHA Worker</option>
            <option value="community">Community Member</option>
            <option value="official">Government Official</option>
          </select>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
