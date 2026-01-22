export default function CandidateCard({ candidate, onView, onShortlist, onReject }) {
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'Pending', color: 'var(--text-muted)' },
            analyzed: { text: 'Analyzed', color: 'var(--accent-info)' },
            shortlisted: { text: '⭐ Shortlisted', color: 'var(--accent-warning)' },
            rejected: { text: 'Rejected', color: 'var(--accent-danger)' }
        };
        return badges[status] || badges.pending;
    };

    const statusBadge = getStatusBadge(candidate.status);

    return (
        <div className="candidate-card" onClick={() => onView(candidate)}>
            <div className="candidate-avatar">
                {getInitials(candidate.name)}
            </div>

            <div className="candidate-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <h4 className="candidate-name">{candidate.name}</h4>
                    <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: statusBadge.color,
                        padding: '2px 8px',
                        background: `${statusBadge.color}20`,
                        borderRadius: 'var(--radius-full)'
                    }}>
                        {statusBadge.text}
                    </span>
                </div>

                <div className="candidate-meta">
                    {candidate.contact?.email && (
                        <span>📧 {candidate.contact.email}</span>
                    )}
                    {candidate.total_experience_years > 0 && (
                        <span>💼 {candidate.total_experience_years} years exp.</span>
                    )}
                </div>

                <div className="skills-list">
                    {candidate.skills?.slice(0, 6).map((skill, index) => (
                        <span
                            key={index}
                            className={`skill-tag ${skill.matched ? 'matched' : ''}`}
                        >
                            {skill.name}
                        </span>
                    ))}
                    {candidate.skills?.length > 6 && (
                        <span className="skill-tag">+{candidate.skills.length - 6} more</span>
                    )}
                </div>
            </div>

            <div className="candidate-score">
                <div
                    className="score-circle"
                    style={{ '--score': candidate.match_score || 0 }}
                >
                    <span className="score-value">{candidate.match_score || 0}%</span>
                </div>
                <span className="score-label">Match Score</span>
            </div>

            <div className="candidate-actions" onClick={(e) => e.stopPropagation()}>
                {candidate.status !== 'shortlisted' && (
                    <button
                        className="btn btn-success btn-icon"
                        onClick={() => onShortlist(candidate.id)}
                        title="Shortlist"
                    >
                        ⭐
                    </button>
                )}
                {candidate.status !== 'rejected' && (
                    <button
                        className="btn btn-danger btn-icon"
                        onClick={() => onReject(candidate.id)}
                        title="Reject"
                    >
                        ✕
                    </button>
                )}
                <button
                    className="btn btn-secondary btn-icon"
                    onClick={() => onView(candidate)}
                    title="View Details"
                >
                    👁
                </button>
            </div>
        </div>
    );
}
