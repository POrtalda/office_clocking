// App.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./context/AuthContext";
import './App.css';

function App() {
  const { login, user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect automatico in base al ruolo
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/home-admin");
      else navigate("/home-user");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);

    if (result.success) {
      setError("");
      setUsername("");
      setPassword("");
      // redirect gestito dal useEffect
    } else {
      setError("Credenziali non valide");
    }
  };

  // Form di login
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default App;