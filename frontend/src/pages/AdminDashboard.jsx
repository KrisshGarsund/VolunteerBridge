/**
 * pages/AdminDashboard.jsx - Admin Dashboard (Redesigned)
 *
 * Premium command-center layout with sidebar, animated stats,
 * data tables, and NGO verification workflow.
 * Sidebar actions (refresh, logout) are fully functional.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';
import AdminSidebar from '../components/AdminSidebar.jsx';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (tab) loadTab();
        const onFocus = () => { if (tab) loadTab(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [tab]);

    async function loadTab() {
        setMsg('');
        if (tab === 'analytics') {
            const res = await api.getAnalytics();
            if (res.success) setAnalytics(res.data);
        } else if (tab === 'users' || tab === 'verify') {
            const res = await api.getAllUsers();
            if (res.success) setUsers(res.data);
        }
    }

    async function handleVerify(id) {
        const res = await api.verifyNGO(id);
        if (res.success) { setMsg('✅ NGO verified successfully!'); loadTab(); }
    }

    async function handleRemove(id) {
        const res = await api.removeUser(id);
        if (res.success) { setMsg('⚡ User deactivated'); loadTab(); }
    }

    const unverifiedCount = users.filter(u => u.role === 'ngo' && !u.is_verified).length;

    return (
        <div className="app-shell">
            <AdminSidebar activeTab={tab} onTabChange={setTab} unverifiedCount={unverifiedCount} />

            <main className="main-content animate-in">
                <div className="page-header">
                    <h1>{tab === 'analytics' ? '📊 Platform Analytics' : tab === 'users' ? '👥 User Management' : '✅ NGO Verification'}</h1>
                    <p>{tab === 'analytics' ? 'Real-time platform metrics across all databases' : tab === 'users' ? 'Manage all user accounts across portals' : 'Review and verify NGO registrations'}</p>
                </div>

                {msg && <div className="alert alert-success">{msg}</div>}

                {/* ---- Analytics ---- */}
                {tab === 'analytics' && analytics && (
                    <>
                        <div className="sidebar-title" style={{ padding: 0, marginBottom: '1rem' }}>USER METRICS</div>
                        <div className="stats-grid">
                            {[
                                { icon: '👤', value: analytics.users.total, label: 'Total Users' },
                                { icon: '🙋', value: analytics.users.volunteers, label: 'Volunteers' },
                                { icon: '🏢', value: analytics.users.ngos, label: 'NGOs' },
                                { icon: '✅', value: analytics.users.verified_ngos, label: 'Verified NGOs' },
                            ].map((s, i) => (
                                <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                                    <div className="stat-icon">{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="sidebar-title" style={{ padding: 0, marginBottom: '1rem', marginTop: '2rem' }}>REQUEST METRICS</div>
                        <div className="stats-grid">
                            {[
                                { icon: '📋', value: analytics.requests.total, label: 'Total Requests' },
                                { icon: '🟢', value: analytics.requests.open, label: 'Open' },
                                { icon: '🔵', value: analytics.requests.in_progress, label: 'In Progress' },
                                { icon: '⚪', value: analytics.requests.completed, label: 'Completed' },
                            ].map((s, i) => (
                                <div key={i} className={`stat-card animate-in stagger-${i + 5}`}>
                                    <div className="stat-icon">{s.icon}</div>
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ---- Users Table ---- */}
                {tab === 'users' && (
                    <div style={{ overflowX: 'auto' }} className="animate-in">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ color: 'var(--clr-text-muted)' }}>{u.email}</td>
                                        <td>
                                            <span className={`badge badge-${u.role === 'admin' ? 'in_progress' : u.role === 'ngo' ? 'medium' : 'open'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-dim)' }}>
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td>
                                            {u.is_active !== false ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span className="pulse-dot"></span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-accent)' }}>Active</span>
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-dim)' }}>Inactive</span>
                                            )}
                                        </td>
                                        <td>
                                            {u.role !== 'admin' && u.is_active !== false && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(u._id)}>
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ---- NGO Verification ---- */}
                {tab === 'verify' && (
                    <div className="card-grid animate-in">
                        {users.filter(u => u.role === 'ngo').length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">🏢</div>
                                <p>No NGOs registered yet.</p>
                            </div>
                        )}
                        {users.filter(u => u.role === 'ngo').map((ngo, i) => (
                            <div key={ngo._id} className={`card animate-in stagger-${i + 1}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                        {ngo.organization_name || ngo.name}
                                    </h3>
                                    <span className={`badge ${ngo.is_verified ? 'badge-verified' : 'badge-unverified'}`}>
                                        {ngo.is_verified ? '✓ Verified' : '⏳ Pending'}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{ngo.email}</p>
                                {ngo.description && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-dim)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                        {ngo.description}
                                    </p>
                                )}
                                {!ngo.is_verified && (
                                    <button className="btn btn-accent btn-sm mt-2" onClick={() => handleVerify(ngo._id)}>
                                        ✅ Verify NGO
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
