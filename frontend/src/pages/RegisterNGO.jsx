/**
 * pages/RegisterNGO.jsx - NGO Registration Page (Redesigned)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api.js';

export default function RegisterNGO() {
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        organization_name: '', description: '', website: '',
    });
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

        const res = await api.registerNGO(form);
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
                <div className="auth-role-icon">🏢</div>
                <h2>Register Your NGO</h2>
                <p className="subtitle">Get your organisation on VolunteerBridge</p>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Contact Person Name</label>
                        <input className="form-control" name="name" placeholder="Jane Smith"
                            value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-control" name="email" type="email" placeholder="contact@ngo.org"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" name="password" type="password" placeholder="Min 6 chars"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Organisation Name</label>
                        <input className="form-control" name="organization_name" placeholder="Helping Hands Foundation"
                            value={form.organization_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description / Mission</label>
                        <textarea className="form-control" name="description" placeholder="What does your NGO do?"
                            value={form.description} onChange={handleChange} rows="3" />
                    </div>
                    <div className="form-group">
                        <label>Website (optional)</label>
                        <input className="form-control" name="website" placeholder="https://ngo.org"
                            value={form.website} onChange={handleChange} />
                    </div>
                    <button className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '⏳ Registering…' : '🏢 Register NGO'}
                    </button>
                </form>

                <p className="mt-2 text-center" style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                    Already registered? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
