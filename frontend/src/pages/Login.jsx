/**
 * pages/Login.jsx - Login Page (Redesigned with Role Selection)
 *
 * Users select which portal they want to log into,
 * which routes the auth request to the correct backend.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';

const roles = [
    { id: 'admin', icon: '⚡', label: 'Admin', color: 'linear-gradient(135deg, #8B5CF6, #FF3D5A)', desc: 'Platform management' },
    { id: 'volunteer', icon: '🌿', label: 'Volunteer', color: 'linear-gradient(135deg, #06B6D4, #10B981)', desc: 'Browse & apply' },
    { id: 'ngo', icon: '🏢', label: 'NGO', color: 'linear-gradient(135deg, #6366F1, #F59E0B)', desc: 'Manage requests' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('volunteer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Route login to the correct backend based on selected role
        const res = await api.loginWithRole({ email, password }, selectedRole);
        setLoading(false);

        if (res.success) {
            loginUser(res.data.access_token, res.data.user);
            const role = res.data.user.role;
            navigate(role === 'admin' ? '/admin' : role === 'ngo' ? '/ngo' : '/volunteer');
        } else {
            setError(res.message || 'Login failed. Check your credentials and selected portal.');
        }
    }

    return (
        <div className="auth-wrapper animate-in">
            <div className="auth-card">
                <div className="auth-role-icon">🔐</div>
                <h2>Welcome Back</h2>
                <p className="subtitle">Select your portal and sign in</p>

                {/* Role Selector */}
                <div className="flex gap-1 mb-3" style={{ justifyContent: 'center' }}>
                    {roles.map(r => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRole(r.id)}
                            className={`btn btn-sm ${selectedRole === r.id ? '' : 'btn-ghost'}`}
                            style={selectedRole === r.id ? {
                                background: r.color,
                                color: '#fff',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            } : {}}
                        >
                            {r.icon} {r.label}
                        </button>
                    ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-dim)', marginBottom: '1.5rem' }}>
                    Logging into: <strong style={{ color: 'var(--clr-text-muted)' }}>{roles.find(r => r.id === selectedRole)?.desc}</strong>
                </p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="form-control" type="email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" type="password" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '⏳ Signing in…' : `🚀 Sign In as ${roles.find(r => r.id === selectedRole)?.label}`}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--clr-text-dim)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        Don't have an account?
                    </p>
                    <div className="flex gap-1" style={{ justifyContent: 'center' }}>
                        <Link to="/register/volunteer" className="btn btn-ghost btn-sm">🌿 Volunteer</Link>
                        <Link to="/register/ngo" className="btn btn-ghost btn-sm">🏢 NGO</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
