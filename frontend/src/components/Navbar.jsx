/**
 * components/Navbar.jsx - Top Navigation Bar (Redesigned)
 *
 * Shows role-based theming, user info badge, and portal-aware navigation.
 * For unauthenticated users: Home, How it Works, Volunteer, NGO, Admin links.
 * For authenticated users: Dashboard link, portal-specific nav, user info, logout.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

export default function Navbar() {
    const { isLoggedIn, user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    function dashboardPath() {
        if (!user) return '/';
        const map = { volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' };
        return map[user.role] || '/';
    }

    const portalIcons = {
        admin: '⚡',
        volunteer: '🌿',
        ngo: '🏢',
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    /** Scroll to a section on the landing page */
    function scrollToSection(sectionId) {
        setMobileOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            // After navigation, scroll after a short delay
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Volunteer-specific links
    function renderVolunteerNav() {
        return (
            <>
                <Link to="/volunteer" className={isActive('/volunteer')}>🌍 Browse Requests</Link>
                <Link to="/volunteer" className="">📋 My Tasks</Link>
            </>
        );
    }

    // NGO-specific links
    function renderNGONav() {
        return (
            <>
                <Link to="/ngo" className={isActive('/ngo')}>📄 My Requests</Link>
                <Link to="/ngo" className="">➕ Create Request</Link>
            </>
        );
    }

    // Admin-specific links
    function renderAdminNav() {
        return (
            <>
                <Link to="/admin" className={isActive('/admin')}>📊 Analytics</Link>
                <Link to="/admin" className="">👥 Users</Link>
                <Link to="/admin" className="">✅ Verify NGOs</Link>
            </>
        );
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand-icon">⚡</span>
                    VolunteerBridge
                </Link>

                {/* Mobile hamburger */}
                <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
                    {!isLoggedIn ? (
                        <>
                            {/* Public Navigation */}
                            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMobileOpen(false)}>Home</Link>
                            <button
                                className="nav-link nav-link-btn"
                                onClick={() => scrollToSection('how-it-works')}
                            >
                                How it Works
                            </button>
                            <div className="nav-separator"></div>
                            <Link to="/register/volunteer" className="nav-link nav-portal-link" onClick={() => setMobileOpen(false)}>
                                🌿 Volunteer
                            </Link>
                            <Link to="/register/ngo" className="nav-link nav-portal-link" onClick={() => setMobileOpen(false)}>
                                🏢 NGO
                            </Link>
                            <Link to="/login" className="nav-link nav-portal-link" onClick={() => setMobileOpen(false)}>
                                ⚡ Admin
                            </Link>
                            <div className="nav-separator"></div>
                            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            <Link to="/register/volunteer" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
                        </>
                    ) : (
                        <>
                            {/* Authenticated Navigation — portal-specific */}
                            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMobileOpen(false)}>Home</Link>
                            <Link to={dashboardPath()} className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                            
                            {user?.role === 'volunteer' && renderVolunteerNav()}
                            {user?.role === 'ngo' && renderNGONav()}
                            {user?.role === 'admin' && renderAdminNav()}
                            
                            <div className="nav-separator"></div>
                            <div className="nav-user-info">
                                <span className="nav-user-name">
                                    {portalIcons[user?.role] || '👤'} {user?.name}
                                </span>
                                <span className="nav-user-role">{user?.role}</span>
                            </div>
                            <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
