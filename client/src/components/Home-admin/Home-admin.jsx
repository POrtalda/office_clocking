import './Home-admin.css';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function Home_admin() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  // Redirect al login se user è null
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    setShowLogoutMessage(true);

    // Nascondi messaggio dopo 2 secondi e torna al login
    setTimeout(() => {
      setShowLogoutMessage(false);
      navigate("/login");
    }, 2000);
  };

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

        {showLogoutMessage && (
          <p className="mt-4 text-green-500 animate-fade">
            Logout effettuato!
          </p>
        )}
      </div>
    </div>
  );
}
