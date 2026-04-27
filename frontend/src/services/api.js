/**
 * services/api.js - API Service Layer (Multi-Backend)
 *
 * Routes API calls to the correct backend server:
 *   - Admin:     /api/admin/*     → proxied to port 5001
 *   - Volunteer: /api/volunteer/* → proxied to port 5002
 *   - NGO:       /api/ngo/*       → proxied to port 5003
 *   - Auth:      role-specific routing for login
 *
 * The Vite dev server proxy handles the port routing transparently.
 */

/** Derive the current portal role from the URL path */
function getRoleFromPath() {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/volunteer')) return 'volunteer';
    if (path.startsWith('/ngo')) return 'ngo';
    return null;
}

/** Helper: build headers with the correct role-scoped JWT */
function authHeaders() {
    const role = getRoleFromPath();
    const token = role ? localStorage.getItem(`token_${role}`) : null;
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/** Generic fetch wrapper */
async function request(endpoint, options = {}) {
    try {
        const res = await fetch(endpoint, {
            headers: authHeaders(),
            ...options,
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, message: 'Network error. Is the backend server running?' };
    }
}

/* ==== Auth ==== */

/** Register volunteer → Volunteer backend (port 5002) */
export const registerVolunteer = (body) =>
    request('/api/auth/register/volunteer', { method: 'POST', body: JSON.stringify(body) });

/** Register NGO → NGO backend (port 5003) */
export const registerNGO = (body) =>
    request('/api/auth/register/ngo', { method: 'POST', body: JSON.stringify(body) });

/**
 * Login with role selection → routes to the correct backend.
 * Uses role-specific login endpoints so the Vite proxy sends
 * the request to the correct backend port.
 */
export const loginWithRole = (body, role) => {
    const loginPaths = {
        admin: '/api/auth/login/admin',
        volunteer: '/api/auth/login/volunteer',
        ngo: '/api/auth/login/ngo',
    };
    return request(loginPaths[role] || '/api/auth/login/volunteer', {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

/** Legacy login (backwards compat) */
export const login = (body) =>
    request('/api/auth/login/volunteer', { method: 'POST', body: JSON.stringify(body) });

/* ==== Volunteer (port 5002) ==== */

export const getAvailableRequests = () =>
    request('/api/volunteer/requests');

export const acceptRequest = (id) =>
    request(`/api/volunteer/requests/${id}/accept`, { method: 'POST' });

export const getMyTasks = () =>
    request('/api/volunteer/tasks');

/* ==== NGO (port 5003) ==== */

export const createHelpRequest = (body) =>
    request('/api/ngo/requests', { method: 'POST', body: JSON.stringify(body) });

export const getNGORequests = () =>
    request('/api/ngo/requests');

export const getApplicants = (id) =>
    request(`/api/ngo/requests/${id}/applicants`);

export const approveVolunteer = (reqId, volunteerId) =>
    request(`/api/ngo/requests/${reqId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ volunteer_id: volunteerId }),
    });

export const markCompleted = (id) =>
    request(`/api/ngo/requests/${id}/complete`, { method: 'PUT' });

/* ==== Admin (port 5001) ==== */

export const verifyNGO = (id) =>
    request(`/api/admin/ngo/${id}/verify`, { method: 'PUT' });

export const removeUser = (id) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' });

export const getAllUsers = () =>
    request('/api/admin/users');

export const getAnalytics = () =>
    request('/api/admin/analytics');

/* ==== Profile ==== */

export const getVolunteerProfile = () =>
    request('/api/volunteer/profile');

export const getNGOProfile = () =>
    request('/api/ngo/profile');
