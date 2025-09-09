import './Home-admin.css';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Calendar from "react-calendar";
import { AuthContext } from "../../context/AuthContext";

export default function Home_admin() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalTime, setTotalTime] = useState("0h 0m 0s");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://portalda.github.io/fake-api-office-clocking/list-users-office-clocking.json"
        );
        const data = await res.json();
        setUsersList(data);
      } catch (err) {
        console.error("Errore fetch utenti:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setRecords([]);
      setTotalTime("0h 0m 0s");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const dayKey = selectedDate.toLocaleDateString("it-IT");

    const dayRecords = (stored[dayKey] || [])
      .filter(rec => rec.user === selectedUser)
      .sort((a, b) => new Date(a.entrata) - new Date(b.entrata));

    setRecords(dayRecords);

    let totalMs = 0;
    dayRecords.forEach(rec => {
      if (rec.entrata && rec.uscita) totalMs += new Date(rec.uscita) - new Date(rec.entrata);
    });

    const totalSec = Math.floor(totalMs / 1000) % 60;
    const totalMin = Math.floor(totalMs / (1000 * 60)) % 60;
    const totalHrs = Math.floor(totalMs / (1000 * 60 * 60));
    setTotalTime(`${totalHrs}h ${totalMin}m ${totalSec}s`);
  }, [selectedDate, selectedUser]);

  const handleLogout = () => {
    logout();
    setShowLogoutMessage(true);
    setTimeout(() => {
      setShowLogoutMessage(false);
      navigate("/login");
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="home-admin-container">
      <div className="home-admin-box">
        <h2 className="home-admin-title">Benvenuto, {user.username}!</h2>
        <p>Sei loggato come <strong>{user.role}</strong>.</p>

        <div className="home-admin-calendar">
          <h3>Seleziona un giorno</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} locale="it-IT" />
        </div>

        <div className="home-admin-select">
          <h3>Seleziona un utente</h3>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">-- Seleziona utente --</option>
            {usersList.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
          </select>
        </div>

        <div className="home-admin-records">
          <h3>Bollature di {selectedUser || "utente non selezionato"} il {selectedDate.toLocaleDateString("it-IT")}</h3>

          {records.length > 0 ? (
            <>
              <ul className="record-list">
                {records.map((rec, i) => {
                  const incomplete = !rec.uscita;
                  return (
                    <li key={i} className={`record-item ${incomplete ? 'incomplete' : ''}`}>
                      <p><strong>Bollatura #{i + 1}</strong></p>
                      <p>Entrata: {new Date(rec.entrata).toLocaleString("it-IT")}</p>
                      <p>Uscita: {rec.uscita ? new Date(rec.uscita).toLocaleString("it-IT") : "— Incompleta —"}</p>
                      <p>Tempo trascorso: {rec.tempo || "— Incompleta —"}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="total-time">Tempo totale lavorato: {totalTime}</p>
            </>
          ) : <p className="no-records">{selectedUser ? "Nessuna bollatura registrata" : "Seleziona un utente"}</p>}
        </div>

        <button onClick={handleLogout} className="btn-danger">Logout</button>
        {showLogoutMessage && <p className="logout-msg">Logout effettuato!</p>}
      </div>
    </div>
  );
}
