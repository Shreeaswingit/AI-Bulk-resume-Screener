export default function Sidebar({ activeSection, onSectionChange, onThemeToggle, isDarkMode }) {
    const navItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'upload', icon: '📤', label: 'Upload Resumes' },
        { id: 'candidates', icon: '👥', label: 'Candidates' },
        { id: 'shortlisted', icon: '⭐', label: 'Shortlisted' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">🎯</div>
                <span className="logo-text">ResumeAI</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div style={{
                marginTop: 'auto',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid var(--border-color)'
            }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-md)'
                    }}
                >
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                        {isDarkMode ? '🌙 Dark' : '☀️ Light'}
                    </span>
                    <div className="theme-toggle" onClick={onThemeToggle}>
                        <div className="theme-toggle-knob"></div>
                    </div>
                </div>

                <div style={{
                    padding: 'var(--spacing-md)',
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
