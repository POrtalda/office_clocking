import { BrowserRouter, Route, Routes } from 'react-router'
import App from '../App';
import Home_user from '../components/Home-user/Home-user';
import Home_admin from '../components/Home-admin/Home-admin';
import Storico from '../components/Storico/Storico';
import { AuthProvider } from '../context/AuthContext';

export default function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<App />} />
                    <Route path='login' element={<App />} />
                    <Route path='home-user' element={<Home_user />} />
                    <Route path='home-admin' element={<Home_admin />} />
                    <Route path='storico' element={<Storico />} />
                    <Route path='*' element={<h1>404 Not Found</h1>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>

    );
}