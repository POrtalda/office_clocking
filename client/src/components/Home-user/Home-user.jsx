import './Home-user.css';
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function Home_user() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect al login se user è null
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/"); // torna al login
  };

  // Evita errori se user è ancora null
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-4">Benvenuto, {user.username}!</h2>
        <p className="mb-6">Sei loggato come <strong>{user.role}</strong>.</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
