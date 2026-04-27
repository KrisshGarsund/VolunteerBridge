/**
 * context/AuthContext.jsx - Authentication Context (Multi-Portal Support)
 *
 * Provides user state (token, role, name) via React Context
 * so any component can check auth status without prop drilling.
 *
 * KEY FEATURE: Role-scoped localStorage keys allow simultaneous
 * sessions across multiple browser tabs — e.g. Volunteer in Tab 1,
 * NGO in Tab 2 — without one session overwriting the other.
 *
 * Storage format:
 *   token_volunteer / user_volunteer
 *   token_ngo       / user_ngo
 *   token_admin     / user_admin
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

/** Derive the portal role from the current URL path */
function getRoleFromPath(pathname) {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/volunteer') || pathname.startsWith('/register/volunteer')) return 'volunteer';
    if (pathname.startsWith('/ngo') || pathname.startsWith('/register/ngo')) return 'ngo';
    return null;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // On mount & route change, restore the session that matches the current portal
    useEffect(() => {
        const role = getRoleFromPath(location.pathname);

        if (role) {
            // We are inside a specific portal — restore that portal's session
            const storedToken = localStorage.getItem(`token_${role}`);
            const storedUser = localStorage.getItem(`user_${role}`);
            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch { /* corrupted data — ignore */ }
            } else {
                // No session for this portal
                setToken(null);
                setUser(null);
            }
        } else {
            // Public pages (/, /login) — find any active session for navbar display
            for (const r of ['volunteer', 'ngo', 'admin']) {
                const t = localStorage.getItem(`token_${r}`);
                const u = localStorage.getItem(`user_${r}`);
                if (t && u) {
                    try {
                        setToken(t);
                        setUser(JSON.parse(u));
                        setLoading(false);
                        return;
                    } catch { /* ignore */ }
                }
            }
            // No active session at all
            setToken(null);
            setUser(null);
        }
        setLoading(false);
    }, [location.pathname]);

    /**
     * Call after successful login.
     * Stores the session under a role-specific key so other portals
     * in separate tabs remain unaffected.
     */
    function loginUser(accessToken, userData) {
        const role = userData.role;
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem(`token_${role}`, accessToken);
        localStorage.setItem(`user_${role}`, JSON.stringify(userData));
    }

    /**
     * Update the stored user data (e.g. after fetching profile info).
     */
    function updateUser(updatedData) {
        const merged = { ...user, ...updatedData };
        setUser(merged);
        if (merged.role) {
            localStorage.setItem(`user_${merged.role}`, JSON.stringify(merged));
        }
    }

    /**
     * Call on logout.
     * Only clears the current role's session, leaving other portal
     * sessions intact in other tabs.
     */
    function logoutUser() {
        if (user?.role) {
            localStorage.removeItem(`token_${user.role}`);
            localStorage.removeItem(`user_${user.role}`);
        }
        // Also clean up legacy keys (from before multi-portal support)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }

    const value = { user, token, loginUser, logoutUser, updateUser, isLoggedIn: !!token, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
