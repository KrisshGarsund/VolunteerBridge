/**
 * pages/RegisterVolunteer.jsx - Volunteer Registration Page (Redesigned)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api.js';

export default function RegisterVolunteer() {
    const [form, setForm] = useState({ name: '', email: '', password: '', skills: '', bio: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const body = {
            ...form,
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        };

        const res = await api.registerVolunteer(body);
        setLoading(false);

        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message || 'Registration failed');
        }
    }

    return (
        <div className="auth-wrapper animate-in">
            <div className="auth-card">
                <div className="auth-role-icon">🌿</div>
                <h2>Join as Volunteer</h2>
                <p className="subtitle">Create your account and start making a difference</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="form-control" name="name" placeholder="John Doe"
                            value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-control" name="email" type="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" name="password" type="password" placeholder="Min 6 chars, 1 letter, 1 digit"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Skills (comma-separated)</label>
                        <input className="form-control" name="skills" placeholder="teaching, cooking, coding"
                            value={form.skills} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Short Bio</label>
                        <textarea className="form-control" name="bio" placeholder="Tell NGOs about yourself…"
                            value={form.bio} onChange={handleChange} rows="3" />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '⏳ Registering…' : '🌿 Create Volunteer Account'}
                    </button>
                </form>

                <p className="mt-2 text-center" style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
