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
      .filter(rec => rec.user === user.username)
      .sort((a, b) => new Date(a.entrata) - new Date(b.entrata));

    setRecords(dayRecords);
  }, [selectedDate, user]);

  if (!user) return null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-6">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Storico bollature di {user.username}</h2>

        <div className="border p-4 rounded mb-6 bg-green-50">
          <h3 className="text-lg font-semibold mb-2">Seleziona un giorno</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} locale="it-IT" />
        </div>

        <div className="border p-4 rounded bg-orange-50 mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Bollature del {selectedDate.toLocaleDateString("it-IT")}
          </h3>

          {records.length > 0 ? (
            <ul className="space-y-3">
              {records.map((rec, i) => {
                const incomplete = !rec.uscita;
                return (
                  <li key={i} className={`p-3 border rounded shadow-sm text-left ${incomplete ? 'bg-red-100' : 'bg-white'}`}>
                    <p><strong>Entrata:</strong> {new Date(rec.entrata).toLocaleString("it-IT")}</p>
                    <p><strong>Uscita:</strong> {rec.uscita ? new Date(rec.uscita).toLocaleString("it-IT") : "— Incompleta —"}</p>
                    <p><strong>Tempo trascorso:</strong> {rec.tempo || "— Incompleta —"}</p>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-gray-500">Nessuna bollatura registrata</p>}
        </div>

        <div className="text-center">
          <button onClick={() => navigate("/home-user")} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}
