export default function CandidateModal({ candidate, isOpen, onClose, onShortlist, onReject }) {
    if (!candidate) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: 'white'
                            }}
                        >
                            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>{candidate.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                {candidate.contact?.email} • {candidate.total_experience_years || 0} years experience
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Match Score Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-xl)'
                    }}>
                        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <div style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: '700',
                                color: 'var(--accent-primary)',
                                marginBottom: 'var(--spacing-xs)'
                            }}>
                                {candidate.match_score || 0}%
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                Match Score
                            </div>
                        </div>
                        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <div style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: '700',
                                color: 'var(--accent-success)',
                                marginBottom: 'var(--spacing-xs)'
                            }}>
                                {candidate.skill_match_percentage || 0}%
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                Skills Match
                            </div>
                        </div>
                        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <div style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: '700',
                                color: 'var(--accent-warning)',
                                marginBottom: 'var(--spacing-xs)'
                            }}>
                                {candidate.total_experience_years || 0}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                Years Exp
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {candidate.summary && (
                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📋 Summary</h4>
                            <p style={{ lineHeight: '1.7' }}>{candidate.summary}</p>
                        </div>
                    )}

                    {/* AI Recommendation */}
                    {candidate.ai_recommendation && (
                        <div style={{
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-lg)',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--accent-primary)'
                        }}>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                                🤖 AI Recommendation
                            </h4>
                            <p>{candidate.ai_recommendation}</p>
                        </div>
                    )}

                    {/* Skills */}
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>💡 Skills</h4>
                        <div className="skills-list">
                            {candidate.skills?.map((skill, index) => (
                                <span
                                    key={index}
                                    className={`skill-tag ${skill.matched ? 'matched' : ''}`}
                                    style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                                >
                                    {skill.name}
                                    {skill.years && ` (${skill.years}y)`}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    {candidate.experience?.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>💼 Experience</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {candidate.experience.map((exp, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            borderLeft: '3px solid var(--accent-secondary)'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                            {exp.title}
                                        </div>
                                        <div style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--font-size-sm)',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}>
                                            {exp.company} • {exp.duration}
                                        </div>
                                        {exp.description && (
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {candidate.education?.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>🎓 Education</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {candidate.education.map((edu, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600' }}>{edu.degree}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            {edu.institution} {edu.year && `• ${edu.year}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strengths & Concerns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                        {candidate.strengths?.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-success)' }}>
                                    ✅ Strengths
                                </h4>
                                <ul style={{
                                    listStyle: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--spacing-sm)'
                                }}>
                                    {candidate.strengths.map((strength, index) => (
                                        <li key={index} style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {candidate.concerns?.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-warning)' }}>
                                    ⚠️ Areas to Verify
                                </h4>
                                <ul style={{
                                    listStyle: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--spacing-sm)'
                                }}>
                                    {candidate.concerns.map((concern, index) => (
                                        <li key={index} style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {concern}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    {candidate.status !== 'rejected' && (
                        <button className="btn btn-danger" onClick={() => onReject(candidate.id)}>
                            ✕ Reject
                        </button>
                    )}
                    {candidate.status !== 'shortlisted' && (
                        <button className="btn btn-success" onClick={() => onShortlist(candidate.id)}>
                            ⭐ Shortlist
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
