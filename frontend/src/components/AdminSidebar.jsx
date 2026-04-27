/**
 * components/AdminSidebar.jsx - Admin Portal Sidebar Navigation
 *
 * Dark command-center themed sidebar with icon + label nav items.
 * Shows admin info, navigation for Analytics, Users, NGO Verification,
 * and functional sidebar actions.
 */

import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ activeTab, onTabChange, unverifiedCount = 0 }) {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const links = [
        { id: 'analytics', icon: '📊', label: 'Analytics', desc: 'Platform overview' },
        { id: 'users', icon: '👥', label: 'Manage Users', desc: 'View all accounts' },
        { id: 'verify', icon: '✅', label: 'NGO Verification', desc: 'Pending approvals', badge: unverifiedCount },
    ];

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    function handleRefresh() {
        // Reload current tab data
        const currentTab = activeTab;
        onTabChange('');
        setTimeout(() => onTabChange(currentTab), 50);
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-portal-name">⚡ Admin Portal</div>
                <div className="sidebar-portal-desc">Platform Command Center</div>
            </div>

            {/* Admin Info Card */}
            {user && (
                <div className="sidebar-profile-card">
                    <div className="sidebar-profile-avatar sidebar-profile-avatar-admin">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="sidebar-profile-info">
                        <div className="sidebar-profile-name">{user.name || 'Administrator'}</div>
                        <div className="sidebar-profile-email">{user.email || ''}</div>
                        <div className="sidebar-profile-badge verified">🛡️ Super Admin</div>
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
