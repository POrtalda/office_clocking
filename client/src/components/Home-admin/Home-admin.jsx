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

  // Dashboard
  const [entrataOggiCompleta, setEntrataOggiCompleta] = useState(true);
  const [uscitaIeriCompleta, setUscitaIeriCompleta] = useState(true);
  const [ritardoStatus, setRitardoStatus] = useState("green");

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

  // Calcolo dashboard
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const todayKey = new Date().toLocaleDateString("it-IT");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString("it-IT");

    const entrateOggi = usersList.every(u =>
      stored[todayKey]?.some(r => r.user.toLowerCase() === u.username.toLowerCase() && r.entrata)
    );
    setEntrataOggiCompleta(entrateOggi);

    const usciteIeri = usersList.every(u =>
      stored[yesterdayKey]?.some(r => r.user.toLowerCase() === u.username.toLowerCase() && r.uscita)
    );
    setUscitaIeriCompleta(usciteIeri);

    let status = "green";
    usersList.forEach(u => {
      const rec = stored[todayKey]?.find(r => r.user.toLowerCase() === u.username.toLowerCase() && r.entrata);
      if (rec) {
        const entrataTime = new Date(rec.entrata);
        const h = entrataTime.getHours();
        const m = entrataTime.getMinutes();
        if (h > 9 || (h === 9 && m > 30)) status = "red";
        else if (h === 9 && m > 15 && status !== "red") status = "yellow";
      }
    });
    setRitardoStatus(status);
  }, [usersList]);

  // Click dashboard
  const checkEntrataOggi = () => {
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const todayKey = new Date().toLocaleDateString("it-IT");
    const mancanti = usersList
      .filter(u => !stored[todayKey]?.some(r => r.user.toLowerCase() === u.username.toLowerCase() && r.entrata))
      .map(u => u.username);
    if (mancanti.length === 0) alert("Tutti i dipendenti hanno fatto entrata oggi!");
    else alert("Mancata entrata oggi:\n" + mancanti.join("\n"));
  };

  const checkRitardi = () => {
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const todayKey = new Date().toLocaleDateString("it-IT");

    const ritardatari = usersList
      .map(u => {
        const rec = stored[todayKey]?.find(r => r.user.toLowerCase() === u.username.toLowerCase() && r.entrata);
        if (rec) {
          const entrataTime = new Date(rec.entrata);
          const h = entrataTime.getHours();
          const m = entrataTime.getMinutes();
          if (h > 9 || (h === 9 && m > 15)) {
            return `${u.username}: ${entrataTime.toLocaleTimeString("it-IT")}`;
          }
        }
        return null;
      })
      .filter(x => x !== null);

    if (ritardatari.length === 0) alert("Nessun ritardo oggi!");
    else alert("Ritardi oggi:\n" + ritardatari.join("\n"));
  };

  const checkUscitaIeri = () => {
    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString("it-IT");

    const mancanti = usersList
      .filter(u => !stored[yesterdayKey]?.some(r => r.user.toLowerCase() === u.username.toLowerCase() && r.uscita))
      .map(u => u.username);
    if (mancanti.length === 0) alert("Tutti i dipendenti hanno fatto uscita ieri!");
    else alert("Mancata uscita ieri:\n" + mancanti.join("\n"));
  };

  // Record utente selezionato
  useEffect(() => {
    if (!selectedUser) {
      setRecords([]);
      setTotalTime("0h 0m 0s");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("storico")) || {};
    const dayKey = selectedDate.toLocaleDateString("it-IT");

    const dayRecords = (stored[dayKey] || [])
      .filter(rec => rec.user.toLowerCase() === selectedUser.toLowerCase())
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

        {/* DASHBOARD */}
        {user.role === "admin" && (
          <div className="admin-dashboard">
            <div className="dashboard-card green" onClick={checkEntrataOggi}>
              Bollature Entrata Oggi
            </div>
            <div className="dashboard-card orange" onClick={checkRitardi}>
              Ritardi
              <div className={`traffic-light ${ritardoStatus}`}></div>
            </div>
            <div className="dashboard-card blue" onClick={checkUscitaIeri}>
              Bollature Uscita Ieri
            </div>
          </div>
        )}

        {/* CALENDARIO */}
        <div className="home-admin-calendar centered">
          <h3>Seleziona un giorno</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} locale="it-IT" />
        </div>

        {/* SELECT UTENTE */}
        <div className="home-admin-select">
          <h3>Seleziona un utente</h3>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">-- Seleziona utente --</option>
            {usersList.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
          </select>
        </div>

        {/* RECORD */}
        <div className="home-admin-records">
          <h3>Bollature di {selectedUser || "utente non selezionato"} il {selectedDate.toLocaleDateString("it-IT")}</h3>
          {records.length > 0 ? (
            <>
              <ul className="records-list">
                {records.map((rec, i) => {
                  const incomplete = !rec.uscita;
                  return (
                    <li key={i} className={`record-item ${incomplete ? 'record-incomplete' : ''}`}>
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
          ) : <p className="no-data">{selectedUser ? "Nessuna bollatura registrata" : "Seleziona un utente"}</p>}
        </div>

        {/* LOGOUT */}
        <div className="logout-container">
          <button onClick={handleLogout} className="btn-logout">
            Logout <span className="logout-icon">⮕</span>
          </button>
          {showLogoutMessage && <p className="logout-msg">Logout effettuato!</p>}
        </div>

      </div>
    </div>
  );
}
