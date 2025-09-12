import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router';
import App from '../App';
import Home_user from '../components/Home-user/Home-user';
import Home_admin from '../components/Home-admin/Home-admin';
import Storico from '../components/Storico/Storico';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Wrapper per protezione delle route
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth ();
  const location = useLocation();

  if (!user) {
    // se non loggato, redirect a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role.toLowerCase())) {
    // se ruolo non autorizzato, redirect alla home corretta
    return <Navigate to={user.role.toLowerCase() === "admin" ? "/home-admin" : "/home-user"} replace />;
  }

  return children;
}

// Wrapper per rendere case-insensitive le route
function CaseInsensitiveRoute({ path, element }) {
  const location = useLocation();
  if (location.pathname.toLowerCase() === path.toLowerCase()) {
    return element;
  }
  return null;
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<App />} />

          {/* Home user protetta */}
          <Route
            path="/home-user"
            element={
              <ProtectedRoute roles={["user"]}>
                <Home_user />
              </ProtectedRoute>
            }
          />

          {/* Home admin protetta */}
          <Route
            path="/home-admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Home_admin />
              </ProtectedRoute>
            }
          />

          {/* Storico protetto */}
          <Route
            path="/storico"
            element={
              <ProtectedRoute roles={["user"]}>
                <Storico />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
