import './Home-user.css';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function Home_user() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [entrata, setEntrata] = useState(null);
  const [uscita, setUscita] = useState(null);
  const [tempoTrascorso, setTempoTrascorso] = useState(null);

  // Aggiorna orologio ogni secondo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect al login se user è null
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Sincronizza stato con eventuale record incompleto del giorno corrente
  useEffect(() => {
    if (!user) return;
    const dayKey = new Date().toLocaleDateString("it-IT");
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const dayRecords = stored[dayKey] || [];
    const incompleteRecord = dayRecords
      .filter(rec => rec.user === user.username && !rec.uscita)
      .pop();
    if (incompleteRecord) {
      setEntrata(new Date(incompleteRecord.entrata));
      setUscita(null);
      setTempoTrascorso(null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowLogoutMessage(true);
    setTimeout(() => {
      setShowLogoutMessage(false);
      navigate("/login");
    }, 2000);
  };

  const handleStamp = () => {
    const now = new Date();
    const dayKey = now.toLocaleDateString("it-IT");
    const stored = JSON.parse(localStorage.getItem("storico")) || {};

    if (!entrata) {
      // Entrata
      setEntrata(now);
      setUscita(null);
      setTempoTrascorso(null);

      const newRecord = {
        entrata: now.toISOString(),
        uscita: null,
        tempo: null,
        user: user.username,
      };

      if (!stored[dayKey]) stored[dayKey] = [];
      stored[dayKey].push(newRecord);
      localStorage.setItem("storico", JSON.stringify(stored));

    } else if (!uscita) {
      // Uscita
      setUscita(now);

      const diffMs = now - entrata;
      const diffSec = Math.floor(diffMs / 1000) % 60;
      const diffMin = Math.floor(diffMs / (1000 * 60)) % 60;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffFormatted = `${diffHrs}h ${diffMin}m ${diffSec}s`;
      setTempoTrascorso(diffFormatted);

      const dayRecords = stored[dayKey] || [];
      for (let i = dayRecords.length - 1; i >= 0; i--) {
        if (dayRecords[i].user === user.username && !dayRecords[i].uscita) {
          dayRecords[i].uscita = now.toISOString();
          dayRecords[i].tempo = diffFormatted;
          break;
        }
      }
      stored[dayKey] = dayRecords;
      localStorage.setItem("storico", JSON.stringify(stored));

    } else {
      // Reset e nuova entrata
      setEntrata(now);
      setUscita(null);
      setTempoTrascorso(null);

      const newRecord = {
        entrata: now.toISOString(),
        uscita: null,
        tempo: null,
        user: user.username,
      };
      if (!stored[dayKey]) stored[dayKey] = [];
      stored[dayKey].push(newRecord);
      localStorage.setItem("storico", JSON.stringify(stored));
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Benvenuto, {user.username}!</h2>
        <p className="mb-6">Sei loggato come <strong>{user.role}</strong>.</p>

        <div className="border p-4 rounded mb-4 bg-gray-50">
          <h3 className="text-lg font-semibold">Orologio</h3>
          <p className="text-xl font-mono">
            {currentTime.toLocaleDateString("it-IT")} {currentTime.toLocaleTimeString("it-IT")}
          </p>
        </div>

        <div className="border p-4 rounded mb-4 bg-pink-50">
          <h3 className="text-lg font-semibold">Bollatura</h3>
          <p>Entrata: {entrata ? entrata.toLocaleString("it-IT") : "Nessuna"}</p>
          <p>Uscita: {uscita ? uscita.toLocaleString("it-IT") : "Nessuna"}</p>
          {tempoTrascorso && <p className="mt-2 text-green-600 font-semibold">Tempo trascorso: {tempoTrascorso}</p>}
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleStamp}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {entrata && !uscita ? "Bollatura Uscita" : "Bollatura Entrata"}
          </button>

          <button
            onClick={() => navigate("/storico")}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Vai allo Storico
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {showLogoutMessage && <p className="mt-4 text-green-500 animate-fade">Logout effettuato!</p>}
      </div>
    </div>
  );
}
