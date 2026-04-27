/**
 * components/NGOSidebar.jsx - NGO Portal Sidebar Navigation
 *
 * Professional warm-toned sidebar with indigo/amber accents.
 * Shows the NGO's organization name, navigation for Create Request,
 * My Requests, and Profile. Includes functional sidebar actions.
 */

import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function NGOSidebar({ activeTab, onTabChange, requestCount = 0 }) {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const links = [
        { id: 'create', icon: '➕', label: 'Create Request', desc: 'Post a new help request' },
        { id: 'requests', icon: '📄', label: 'My Requests', desc: 'Manage your requests', badge: requestCount },
        { id: 'profile', icon: '🏢', label: 'Organisation Profile', desc: 'View your info' },
    ];

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    function handleRefresh() {
        onTabChange('requests');
    }

    // Get the organization name from user data
    const orgName = user?.organization_name || user?.name || 'NGO Portal';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-portal-name">🏢 {orgName}</div>
                <div className="sidebar-portal-desc">Manage Your Organisation</div>
            </div>

            {/* NGO Info Card */}
            {user && (
                <div className="sidebar-profile-card">
                    <div className="sidebar-profile-avatar sidebar-profile-avatar-ngo">
                        {orgName.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-profile-info">
                        <div className="sidebar-profile-name">{orgName}</div>
                        <div className="sidebar-profile-email">{user.email || ''}</div>
                        {user.is_verified !== undefined && (
                            <div className={`sidebar-profile-badge ${user.is_verified ? 'verified' : 'pending'}`}>
                                {user.is_verified ? '✓ Verified' : '⏳ Pending Verification'}
                            </div>
                        )}
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
