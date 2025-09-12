import './Storico.css';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Calendar from "react-calendar";
import { AuthContext } from "../../context/AuthContext";

export default function Storico() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const dayKey = selectedDate.toLocaleDateString("it-IT");

    const dayRecords = (stored[dayKey] || [])
      .filter(rec => rec.user.toLowerCase() === user.username.toLowerCase())
      .sort((a, b) => new Date(a.entrata) - new Date(b.entrata));

    setRecords(dayRecords);
  }, [selectedDate, user]);

  if (!user) return null;

  return (
    <div className="storico-container">
      <div className="storico-box">
        <h2 className="storico-title">
          Storico bollature di {user.username}
        </h2>

        <div className="storico-calendar">
          <h3>Seleziona un giorno</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} locale="it-IT" />
        </div>

        <div className="storico-list-container">
          <h3>Bollature del {selectedDate.toLocaleDateString("it-IT")}</h3>

          {records.length > 0 ? (
            <ul className="storico-list">
              {records.map((rec, i) => {
                const incomplete = !rec.uscita;
                return (
                  <li key={i} className={`storico-item ${incomplete ? 'incomplete' : ''}`}>
                    <p><strong>Entrata:</strong> {new Date(rec.entrata).toLocaleString("it-IT")}</p>
                    <p><strong>Uscita:</strong> {rec.uscita ? new Date(rec.uscita).toLocaleString("it-IT") : "— Incompleta —"}</p>
                    <p><strong>Tempo trascorso:</strong> {rec.tempo || "— Incompleta —"}</p>
                  </li>
                );
              })}
            </ul>
          ) : <p className="storico-empty">Nessuna bollatura registrata</p>}
        </div>

        <div className="storico-actions">
          <button onClick={() => navigate("/home-user")} className="btn-logout">
            Torna alla Home <span className="logout-icon">⮕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
