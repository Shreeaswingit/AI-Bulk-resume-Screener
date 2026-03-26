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

    const getRecommendationColor = (cat) => {
        if (!cat) return 'var(--text-muted)';
        if (cat.includes('Selected')) return 'var(--accent-success)';
        if (cat.includes('Considered')) return 'var(--accent-warning)';
        if (cat.includes('Rejected')) return 'var(--accent-danger)';
        return 'var(--accent-info)';
    };

    return (
        <div className="candidate-card" onClick={() => onView(candidate)} style={{ position: 'relative' }}>
            {/* Rank Badge */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                width: '32px',
                height: '32px',
                background: 'var(--gradient-secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 2
            }}>
                #{candidate.rank || '?'}
            </div>

            <div className="candidate-avatar">
                {getInitials(candidate.name)}
            </div>

            <div className="candidate-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <h4 className="candidate-name" style={{ marginBottom: 0 }}>{candidate.name}</h4>
                    <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: statusBadge.color,
                        padding: '2px 8px',
                        background: `${statusBadge.color}20`,
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '600'
                    }}>
                        {statusBadge.text}
                    </span>
                    {candidate.recommendation_category && (
                        <span style={{
                            fontSize: 'var(--font-size-xs)',
                            color: getRecommendationColor(candidate.recommendation_category),
                            padding: '2px 8px',
                            background: `${getRecommendationColor(candidate.recommendation_category)}20`,
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '600',
                            border: `1px solid ${getRecommendationColor(candidate.recommendation_category)}40`
                        }}>
                            {candidate.recommendation_category}
                        </span>
                    )}
                    {candidate.duplicate_of && (
                        <span style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--accent-danger)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 'bold'
                        }}>
                            Duplicate
                        </span>
                    )}
                </div>

                <div className="candidate-meta" style={{ marginTop: 'var(--spacing-xs)' }}>
                    {candidate.contact?.email && (
                        <span title={candidate.contact.email}>📧 {candidate.contact.email.length > 20 ? candidate.contact.email.substring(0, 17) + '...' : candidate.contact.email}</span>
                    )}
                    {candidate.total_experience_years > 0 && (
                        <span>💼 {candidate.total_experience_years}y Exp.</span>
                    )}
                </div>

                <div className="skills-list" style={{ marginTop: 'var(--spacing-sm)' }}>
                    {candidate.skills?.slice(0, 4).map((skill, index) => (
                        <span
                            key={index}
                            className={`skill-tag ${skill.matched ? 'matched' : ''}`}
                            style={{ fontSize: '10px' }}
                        >
                            {skill.name}
                        </span>
                    ))}
                    {candidate.skills?.length > 4 && (
                        <span className="skill-tag" style={{ fontSize: '10px' }}>+{candidate.skills.length - 4}</span>
                    )}
                </div>
            </div>

            <div className="candidate-score">
                <div
                    className="score-circle"
                    style={{ '--score': candidate.match_score || 0 }}
                >
                    <span className="score-value">{Math.round(candidate.match_score || 0)}%</span>
                </div>
                <span className="score-label">Match</span>
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
