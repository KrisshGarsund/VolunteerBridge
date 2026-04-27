/**
 * App.jsx - Root Component with Router (Redesigned)
 *
 * Applies the correct theme class based on the current route:
 *   /admin/*     → theme-admin (crimson/violet)
 *   /volunteer/* → theme-volunteer (emerald/cyan)
 *   /ngo/*       → theme-ngo (indigo/amber)
 *
 * Each portal gets its own visual identity automatically.
 * Footer is shown on every page.
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import RegisterVolunteer from './pages/RegisterVolunteer.jsx';
import RegisterNGO from './pages/RegisterNGO.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import NGODashboard from './pages/NGODashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

/** Route guard: redirects to login if not authenticated. Waits for auth loading to finish. */
function ProtectedRoute({ children, allowedRoles }) {
    const { isLoggedIn, user, loading } = useAuth();

    // Wait for auth state to be restored from localStorage before deciding
    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', color: 'var(--clr-text-muted)', fontSize: '1.1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
                    <p>Loading your session…</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
    return children;
}

/** Determines the theme class based on the current URL path */
function getThemeClass(pathname) {
    if (pathname.startsWith('/admin')) return 'theme-admin';
    if (pathname.startsWith('/volunteer') || pathname.startsWith('/register/volunteer')) return 'theme-volunteer';
    if (pathname.startsWith('/ngo') || pathname.startsWith('/register/ngo')) return 'theme-ngo';
    return '';
}

function AppRoutes() {
    const location = useLocation();
    const themeClass = getThemeClass(location.pathname);

    return (
        <div className={`app-container ${themeClass}`}>
            <Navbar />
            <div className="app-content">
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register/volunteer" element={<RegisterVolunteer />} />
                    <Route path="/register/ngo" element={<RegisterNGO />} />

                    {/* Protected — each portal gets its own theme automatically */}
                    <Route path="/volunteer/*" element={
                        <ProtectedRoute allowedRoles={['volunteer']}>
                            <VolunteerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/ngo/*" element={
                        <ProtectedRoute allowedRoles={['ngo']}>
                            <NGODashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
