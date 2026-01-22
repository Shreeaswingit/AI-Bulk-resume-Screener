export default function StatsCards({ stats }) {
    const cards = [
        {
            icon: '📄',
            label: 'Total Resumes',
            value: stats.total || 0,
            colorClass: 'primary'
        },
        {
            icon: '✅',
            label: 'Analyzed',
            value: stats.analyzed || 0,
            colorClass: 'success'
        },
        {
            icon: '⭐',
            label: 'Shortlisted',
            value: stats.shortlisted || 0,
            colorClass: 'warning'
        },
        {
            icon: '📊',
            label: 'Avg Score',
            value: `${stats.average_score || 0}%`,
            colorClass: 'primary'
        }
    ];

    return (
        <div className="stats-grid">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="stat-card animate-slideUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className={`stat-icon ${card.colorClass}`}>
                        {card.icon}
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{card.value}</div>
                        <div className="stat-label">{card.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
