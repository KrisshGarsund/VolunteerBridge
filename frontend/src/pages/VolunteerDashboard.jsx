/**
 * pages/VolunteerDashboard.jsx - Volunteer Dashboard (Redesigned)
 *
 * Nature-themed portal with sidebar, request cards with urgency
 * color coding, skill tags, task tracking, and profile view.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';
import VolunteerSidebar from '../components/VolunteerSidebar.jsx';

export default function VolunteerDashboard() {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadData();
        window.addEventListener('focus', loadData);
        return () => window.removeEventListener('focus', loadData);
    }, [tab]);

    async function loadData() {
        setLoading(true);
        if (tab === 'requests') {
            const res = await api.getAvailableRequests();
            if (res.success) setRequests(res.data);
        } else if (tab === 'tasks') {
            const res = await api.getMyTasks();
            if (res.success) setTasks(res.data);
        } else if (tab === 'profile') {
            const res = await api.getVolunteerProfile();
            if (res.success) {
                setProfile(res.data);
                updateUser(res.data);
            }
        }
        setLoading(false);
    }

    async function handleAccept(id) {
        setMsg('');
        setApplyingId(id);
        const res = await api.acceptRequest(id);
        setApplyingId(null);
        if (res.success) {
            setMsg('🎉 Applied successfully! The NGO will review your application.');
            loadData();
        } else {
            setMsg(res.message);
        }
    }

    const urgencyStyles = {
        high: { bg: 'rgba(255, 107, 107, 0.1)', border: 'rgba(255, 107, 107, 0.3)', icon: '🔴' },
        medium: { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)', icon: '🟡' },
        low: { bg: 'rgba(0, 217, 166, 0.1)', border: 'rgba(0, 217, 166, 0.3)', icon: '🟢' },
    };

    const statusIcons = {
        open: '🟢',
        in_progress: '🔵',
        completed: '⚪',
    };

    return (
        <div className="app-shell">
            <VolunteerSidebar activeTab={tab} onTabChange={setTab} taskCount={tasks.length} />

            <main className="main-content animate-in">
                <div className="page-header">
                    <h1>{tab === 'requests' ? '🌍 Available Opportunities' : tab === 'tasks' ? '📋 My Tasks' : '👤 My Profile'}</h1>
                    <p>{tab === 'requests' ? 'Browse open help requests from verified NGOs' : tab === 'tasks' ? 'Track your applied and assigned tasks' : 'View and manage your volunteer profile'}</p>
                </div>

                {msg && <div className="alert alert-success">{msg}</div>}

                {/* ---- Browse Requests ---- */}
                {tab === 'requests' && (
                    <div className="card-grid">
                        {requests.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">🌱</div>
                                <p>No open requests at the moment.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Check back soon — NGOs are always posting new opportunities!</p>
                            </div>
                        )}
                        {requests.map((r, i) => {
                            const urgency = urgencyStyles[r.urgency] || urgencyStyles.medium;
                            return (
                                <div key={r._id} className={`card animate-in stagger-${(i % 8) + 1}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{r.title}</h3>
                                        <span className={`badge badge-${r.urgency}`}>
                                            {urgency.icon} {r.urgency}
                                        </span>
                                    </div>

                                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                                        {r.description}
                                    </p>

                                    {r.location && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-dim)', marginBottom: '0.5rem' }}>
                                            📍 {r.location}
                                        </p>
                                    )}

                                    {r.skills_required?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1 mb-2">
                                            {r.skills_required.map((s, j) => (
                                                <span key={j} className="badge badge-open">{s}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--clr-glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                        <button
                                            className="btn btn-accent btn-sm"
                                            onClick={() => handleAccept(r._id)}
                                            disabled={applyingId === r._id}
                                        >
                                            {applyingId === r._id ? '⏳ Applying…' : '🤝 Apply Now'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ---- My Tasks ---- */}
                {tab === 'tasks' && (
                    <div className="card-grid">
                        {tasks.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <p>You haven't applied to any requests yet.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    Browse available requests to get started!
                                </p>
                            </div>
                        )}
                        {tasks.map((t, i) => (
                            <div key={t._id} className={`card animate-in stagger-${(i % 8) + 1}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.title}</h3>
                                    <span className={`badge badge-${t.status}`}>
                                        {statusIcons[t.status] || '⚪'} {t.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{t.description}</p>

                                {t.location && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-dim)', marginTop: '0.5rem' }}>
                                        📍 {t.location}
                                    </p>
                                )}

                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--clr-glass-border)' }}>
                                    <div className="flex items-center gap-1">
                                        <span className="pulse-dot" style={{
                                            background: t.status === 'open' ? '#10B981' : t.status === 'in_progress' ? '#6366F1' : '#6B7280'
                                        }}></span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-dim)' }}>
                                            {t.status === 'open' ? 'Awaiting review' : t.status === 'in_progress' ? 'You\'ve been assigned!' : 'Task completed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ---- Profile ---- */}
                {tab === 'profile' && (
                    <div className="profile-section animate-in">
                        <div className="profile-card-large">
                            <div className="profile-header-section">
                                <div className="profile-avatar-large">
                                    {(profile?.name || user?.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-header-info">
                                    <h2 className="profile-display-name">{profile?.name || user?.name || 'Volunteer'}</h2>
                                    <p className="profile-role-label">🌿 Volunteer</p>
                                </div>
                            </div>

                            <div className="profile-details-grid">
                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📧</span>
                                    <div>
                                        <div className="profile-detail-label">Email</div>
                                        <div className="profile-detail-value">{profile?.email || user?.email || '—'}</div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📅</span>
                                    <div>
                                        <div className="profile-detail-label">Member Since</div>
                                        <div className="profile-detail-value">
                                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📝</span>
                                    <div>
                                        <div className="profile-detail-label">Bio</div>
                                        <div className="profile-detail-value">{profile?.bio || user?.bio || 'No bio provided yet.'}</div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📋</span>
                                    <div>
                                        <div className="profile-detail-label">Tasks Applied</div>
                                        <div className="profile-detail-value">{profile?.accepted_requests?.length || 0} requests</div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="profile-skills-section">
                                <h3 className="profile-section-title">🎯 Skills</h3>
                                <div className="flex flex-wrap gap-1">
                                    {(profile?.skills || user?.skills || []).length > 0 ? (
                                        (profile?.skills || user?.skills).map((skill, i) => (
                                            <span key={i} className="badge badge-open" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.9rem' }}>No skills listed yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="profile-status-section">
                                <div className="flex items-center gap-1">
                                    <span className="pulse-dot"></span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--clr-accent)' }}>
                                        Account Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
