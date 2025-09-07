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

    // tempo totale
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Benvenuto, {user.username}!</h2>
        <p className="mb-6">Sei loggato come <strong>{user.role}</strong>.</p>

        <div className="border p-4 rounded mb-4 bg-green-50">
          <h3 className="text-lg font-semibold mb-2">Seleziona un giorno</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} locale="it-IT" />
        </div>

        <div className="border p-4 rounded mb-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Seleziona un utente</h3>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="border p-2 rounded w-full">
            <option value="">-- Seleziona utente --</option>
            {usersList.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
          </select>
        </div>

        <div className="border p-4 rounded bg-orange-50 mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Bollature di {selectedUser || "utente non selezionato"} il {selectedDate.toLocaleDateString("it-IT")}
          </h3>

          {records.length > 0 ? (
            <>
              <ul className="space-y-3 text-left mb-3">
                {records.map((rec, i) => {
                  const incomplete = !rec.uscita;
                  return (
                    <li key={i} className={`p-3 border rounded shadow-sm ${incomplete ? 'bg-red-100' : 'bg-white'}`}>
                      <p><strong>Bollatura #{i + 1}</strong></p>
                      <p>Entrata: {new Date(rec.entrata).toLocaleString("it-IT")}</p>
                      <p>Uscita: {rec.uscita ? new Date(rec.uscita).toLocaleString("it-IT") : "— Incompleta —"}</p>
                      <p>Tempo trascorso: {rec.tempo || "— Incompleta —"}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="text-lg font-semibold">Tempo totale lavorato: {totalTime}</p>
            </>
          ) : <p className="text-gray-500">{selectedUser ? "Nessuna bollatura registrata" : "Seleziona un utente"}</p>}
        </div>

        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Logout</button>
        {showLogoutMessage && <p className="mt-4 text-green-500 animate-fade">Logout effettuato!</p>}
      </div>
    </div>
  );
}
