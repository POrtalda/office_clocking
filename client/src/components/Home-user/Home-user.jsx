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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Recupero eventuale bollatura in corso
  useEffect(() => {
    if (!user) return;
    const dayKey = new Date().toLocaleDateString("it-IT");
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const dayRecords = stored[dayKey] || [];
    const incompleteRecord = dayRecords
      .filter(rec => rec.user.toLowerCase() === user.username.toLowerCase() && !rec.uscita)
      .pop();
    if (incompleteRecord) {
      setEntrata(new Date(incompleteRecord.entrata));
      setUscita(null);
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

  // Gestione bollatura
  const handleStamp = () => {
    const now = new Date();
    const dayKey = now.toLocaleDateString("it-IT");
    const stored = JSON.parse(localStorage.getItem("storico")) || {};

    if (!entrata) {
      // Nuova entrata
      setEntrata(now);
      setUscita(null);

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

      const dayRecords = stored[dayKey] || [];
      for (let i = dayRecords.length - 1; i >= 0; i--) {
        if (dayRecords[i].user.toLowerCase() === user.username.toLowerCase() && !dayRecords[i].uscita) {
          dayRecords[i].uscita = now.toISOString();
          dayRecords[i].tempo = diffFormatted;
          break;
        }
      }
      stored[dayKey] = dayRecords;
      localStorage.setItem("storico", JSON.stringify(stored));
    } else {
      // Nuovo ciclo entrata
      setEntrata(now);
      setUscita(null);

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
    <div className="home-user-container">
      <div className="home-user-box">
        <h2 className="home-user-title">Benvenuto, {user.username}!</h2>
        <p>Sei loggato come <strong>{user.role}</strong>.</p>

        {/* OROLOGIO */}
        <div className="home-user-clock">
          <h3>Orologio</h3>
          <p>{currentTime.toLocaleDateString("it-IT")} {currentTime.toLocaleTimeString("it-IT")}</p>
        </div>

        {/* SOLO PULSANTE BOLLATURA */}
        <div className="home-user-actions">
          <button onClick={handleStamp} className="btn-primary">
            {entrata && !uscita ? "Bollatura Uscita" : "Bollatura Entrata"}
          </button>
          <button onClick={() => navigate("/storico")} className="btn-secondary">
            Vai allo Storico
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout <span className="logout-icon">⮕</span>
          </button>
        </div>

        {showLogoutMessage && <p className="logout-msg">Logout effettuato!</p>}
      </div>
    </div>
  );
}
