/**
 * components/VolunteerSidebar.jsx - Volunteer Portal Sidebar Navigation
 *
 * Nature-themed sidebar with emerald accents.
 * Shows navigation for Browse Requests, My Tasks, and Profile.
 * Includes volunteer profile info card and functional sidebar options.
 */

import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function VolunteerSidebar({ activeTab, onTabChange, taskCount = 0 }) {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const links = [
        { id: 'requests', icon: '🌍', label: 'Browse Requests', desc: 'Find opportunities' },
        { id: 'tasks', icon: '📋', label: 'My Tasks', desc: 'Track your work', badge: taskCount },
        { id: 'profile', icon: '👤', label: 'My Profile', desc: 'View your info' },
    ];

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    function handleRefresh() {
        // Switch to requests tab and reload data
        onTabChange('requests');
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-portal-name">🌿 Volunteer Portal</div>
                <div className="sidebar-portal-desc">Make a Difference Today</div>
            </div>

            {/* Profile Info Card */}
            {user && (
                <div className="sidebar-profile-card">
                    <div className="sidebar-profile-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="sidebar-profile-info">
                        <div className="sidebar-profile-name">{user.name || 'Volunteer'}</div>
                        <div className="sidebar-profile-email">{user.email || ''}</div>
                    </div>
                </div>
            )}

            <div className="sidebar-title">Navigation</div>
            <nav className="sidebar-nav">
                {links.map(link => (
                    <button
                        key={link.id}
                        className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
                        onClick={() => onTabChange(link.id)}
                    >
                        <span className="sidebar-link-icon">{link.icon}</span>
                        <span>{link.label}</span>
                        {link.badge > 0 && (
                            <span className="sidebar-badge">{link.badge}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-title" style={{ marginTop: 'auto' }}>Actions</div>
            <nav className="sidebar-nav">
                <button className="sidebar-link" onClick={handleRefresh}>
                    <span className="sidebar-link-icon">🔄</span>
                    <span style={{ fontSize: '0.85rem' }}>Refresh Data</span>
                </button>
                <button className="sidebar-link sidebar-link-logout" onClick={handleLogout}>
                    <span className="sidebar-link-icon">🚪</span>
                    <span style={{ fontSize: '0.85rem' }}>Logout</span>
                </button>
            </nav>
        </aside>
    );
}
