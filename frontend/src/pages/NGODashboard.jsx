/**
 * pages/NGODashboard.jsx - NGO Dashboard (Redesigned)
 *
 * Professional warm-toned portal with sidebar, request creation form,
 * request pipeline view, applicant management, and profile view.
 * Shows the NGO organisation name prominently.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';
import NGOSidebar from '../components/NGOSidebar.jsx';

export default function NGODashboard() {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', skills_required: '', location: '', urgency: 'medium' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [selectedReq, setSelectedReq] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadData = () => {
            if (tab === 'requests' || tab === 'create') {
                loadRequests();
            } else if (tab === 'profile') {
                loadProfile();
            }
        };
        loadData();
        window.addEventListener('focus', loadData);
        return () => window.removeEventListener('focus', loadData);
    }, [tab]);

    async function loadRequests() {
        const res = await api.getNGORequests();
        if (res.success) setRequests(res.data);
    }

    async function loadProfile() {
        const res = await api.getNGOProfile();
        if (res.success) {
            setProfile(res.data);
            updateUser(res.data);
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCreate(e) {
        e.preventDefault();
        setMsg(''); setError('');
        const body = {
            ...form,
            skills_required: form.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        };
        const res = await api.createHelpRequest(body);
        if (res.success) {
            setMsg('🎉 Help request published successfully!');
            setForm({ title: '', description: '', skills_required: '', location: '', urgency: 'medium' });
            loadRequests();
        } else {
            setError(res.message);
        }
    }

    async function handleViewApplicants(reqId) {
        if (selectedReq === reqId) {
            setSelectedReq(null);
            return;
        }
        setSelectedReq(reqId);
        const res = await api.getApplicants(reqId);
        if (res.success) setApplicants(res.data);
    }

    async function handleApprove(reqId, volId) {
        const res = await api.approveVolunteer(reqId, volId);
        if (res.success) {
            setMsg('✅ Volunteer approved and assigned!');
            setSelectedReq(null);
            loadRequests();
        }
    }

    async function handleComplete(reqId) {
        const res = await api.markCompleted(reqId);
        if (res.success) {
            setMsg('🛑 Request marked as finished!');
            loadRequests();
        }
    }

    const statusIcons = { open: '🟢', in_progress: '🔵', completed: '⚪' };
    const openCount = requests.filter(r => r.status === 'open').length;

    // Get the organization name
    const orgName = user?.organization_name || profile?.organization_name || user?.name || 'Your Organisation';

    return (
        <div className="app-shell">
            <NGOSidebar activeTab={tab} onTabChange={setTab} requestCount={openCount} />

            <main className="main-content animate-in">
                <div className="page-header">
                    <h1>
                        {tab === 'create' ? '➕ Create Help Request' : tab === 'profile' ? `🏢 ${orgName}` : '📄 My Requests'}
                    </h1>
                    <p>
                        {tab === 'create' ? 'Post a new volunteer opportunity for your organisation' : tab === 'profile' ? 'View and manage your organisation profile' : 'Manage your help requests and review applicants'}
                    </p>
                </div>

                {msg && <div className="alert alert-success">{msg}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {/* ---- Create Request Form ---- */}
                {tab === 'create' && (
                    <div className="card animate-in" style={{ maxWidth: 640 }}>
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                            📝 New Help Request
                        </h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Request Title</label>
                                <input className="form-control" name="title" placeholder="e.g. Teaching volunteers needed"
                                    value={form.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-control" name="description"
                                    placeholder="Describe what help you need, how many volunteers, schedule, etc."
                                    value={form.description} onChange={handleChange} required rows="4" />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Skills Required (comma-separated)</label>
                                    <input className="form-control" name="skills_required"
                                        placeholder="teaching, cooking"
                                        value={form.skills_required} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input className="form-control" name="location"
                                        placeholder="City or area"
                                        value={form.location} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Urgency Level</label>
                                <select className="form-control" name="urgency" value={form.urgency} onChange={handleChange}>
                                    <option value="low">🟢 Low — No rush</option>
                                    <option value="medium">🟡 Medium — Within a week</option>
                                    <option value="high">🔴 High — Urgent help needed</option>
                                </select>
                            </div>
                            <button className="btn btn-accent btn-lg" type="submit" style={{ width: '100%' }}>
                                🚀 Publish Request
                            </button>
                        </form>
                    </div>
                )}

                {/* ---- My Requests ---- */}
                {tab === 'requests' && (
                    <div className="card-grid">
                        {requests.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📄</div>
                                <p>No requests yet. Create your first one!</p>
                            </div>
                        )}
                        {requests.map((r, i) => (
                            <div key={r._id} className={`card animate-in stagger-${(i % 8) + 1}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{r.title}</h3>
                                    <span className={`badge badge-${r.status}`}>
                                        {statusIcons[r.status]} {r.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                                    {r.description}
                                </p>

                                <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--clr-text-dim)', marginBottom: '0.5rem' }}>
                                    <span>👥 {r.applicants?.length || 0} applicant{(r.applicants?.length || 0) !== 1 ? 's' : ''}</span>
                                    {r.urgency && <span className={`badge badge-${r.urgency}`} style={{ fontSize: '0.7rem' }}>{r.urgency}</span>}
                                    {r.assigned_volunteer && <span>· ✅ Assigned</span>}
                                </div>

                                <div className="flex gap-1 mt-2" style={{ borderTop: '1px solid var(--clr-glass-border)', paddingTop: '0.75rem' }}>
                                    {r.status === 'open' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleViewApplicants(r._id)}>
                                            {selectedReq === r._id ? '▲ Hide' : '👁️ View Applicants'}
                                        </button>
                                    )}
                                    {(r.status === 'in_progress' || r.status === 'open') && (
                                        <button className="btn btn-accent btn-sm" onClick={() => handleComplete(r._id)}>
                                            🛑 Finish Request
                                        </button>
                                    )}
                                </div>

                                {/* ---- Applicant Panel ---- */}
                                {selectedReq === r._id && (
                                    <div className="applicant-panel">
                                        <h4 style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>
                                            👥 Applicants ({applicants.length})
                                        </h4>
                                        {applicants.length === 0 && (
                                            <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.9rem' }}>No applicants yet.</p>
                                        )}
                                        {applicants.map(a => (
                                            <div key={a._id} className="applicant-row">
                                                <div>
                                                    <strong>{a.name}</strong>
                                                    <span style={{ color: 'var(--clr-text-dim)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                                        {a.email}
                                                    </span>
                                                    {a.skills?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {a.skills.map((s, j) => (
                                                                <span key={j} className="badge badge-open">{s}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="btn btn-accent btn-sm" onClick={() => handleApprove(r._id, a._id)}>
                                                    ✅ Approve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ---- Organisation Profile ---- */}
                {tab === 'profile' && (
                    <div className="profile-section animate-in">
                        <div className="profile-card-large">
                            <div className="profile-header-section">
                                <div className="profile-avatar-large profile-avatar-ngo">
                                    {orgName.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-header-info">
                                    <h2 className="profile-display-name">{orgName}</h2>
                                    <p className="profile-role-label">🏢 Non-Governmental Organisation</p>
                                    {(profile?.is_verified !== undefined ? profile.is_verified : user?.is_verified) ? (
                                        <span className="badge badge-verified" style={{ marginTop: '0.5rem', display: 'inline-block' }}>✓ Verified Organisation</span>
                                    ) : (
                                        <span className="badge badge-unverified" style={{ marginTop: '0.5rem', display: 'inline-block' }}>⏳ Pending Verification</span>
                                    )}
                                </div>
                            </div>

                            <div className="profile-details-grid">
                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">👤</span>
                                    <div>
                                        <div className="profile-detail-label">Contact Person</div>
                                        <div className="profile-detail-value">{profile?.name || user?.name || '—'}</div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📧</span>
                                    <div>
                                        <div className="profile-detail-label">Email</div>
                                        <div className="profile-detail-value">{profile?.email || user?.email || '—'}</div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📝</span>
                                    <div>
                                        <div className="profile-detail-label">Description / Mission</div>
                                        <div className="profile-detail-value">{profile?.description || user?.description || 'No description provided yet.'}</div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">🌐</span>
                                    <div>
                                        <div className="profile-detail-label">Website</div>
                                        <div className="profile-detail-value">
                                            {(profile?.website || user?.website) ? (
                                                <a href={profile?.website || user?.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clr-accent)' }}>
                                                    {profile?.website || user?.website}
                                                </a>
                                            ) : '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📅</span>
                                    <div>
                                        <div className="profile-detail-label">Registered Since</div>
                                        <div className="profile-detail-value">
                                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="profile-detail-icon">📋</span>
                                    <div>
                                        <div className="profile-detail-label">Total Requests</div>
                                        <div className="profile-detail-value">{requests.length} requests published</div>
                                    </div>
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
