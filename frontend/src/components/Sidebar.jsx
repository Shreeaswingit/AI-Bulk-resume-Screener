import {
    LayoutDashboard,
    Upload,
    Users,
    Star,
    Settings,
    LogOut,
    Moon,
    Sun,
    Target,
    Briefcase
} from 'lucide-react';

export default function Sidebar({ activeSection, onSectionChange, onThemeToggle, isDarkMode, onLogout, user }) {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: Target, label: 'Analytics' },
        { id: 'upload', icon: Upload, label: 'Upload Resumes' },
        { id: 'candidates', icon: Users, label: 'Candidates' },
        { id: 'jobs', icon: Briefcase, label: 'Jobs' }, // Added Jobs item
        { id: 'shortlisted', icon: Star, label: 'Shortlisted' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Target size={24} color="white" />
                </div>
                <span className="logo-text">ResumeAI</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-text">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)'
            }}>
                {user && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-xs)'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--gradient-primary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Admin Role</div>
                        </div>
                    </div>
                )}

                <div
                    className="nav-item"
                    onClick={onLogout}
                    style={{ color: 'var(--accent-danger)' }}
                >
                    <LogOut size={20} className="nav-icon" />
                    <span className="nav-text">Logout</span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-sm) var(--spacing-md)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                            {isDarkMode ? 'Dark' : 'Light'}
                        </span>
                    </div>
                    <div className="theme-toggle" onClick={onThemeToggle}>
                        <div className="theme-toggle-knob"></div>
                    </div>
                </div>

                <div style={{
                    padding: '0 var(--spacing-md) var(--spacing-md)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--font-size-xs)'
                }}>
                    AI Resume Screener v1.0
                </div>
            </div>
        </aside>
    );
}
