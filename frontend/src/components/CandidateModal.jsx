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

                    {/* Duplicate Warning */}
                    {candidate.duplicate_of && (
                        <div style={{
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--accent-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)'
                        }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <div>
                                <strong style={{ color: 'var(--accent-danger)', display: 'block' }}>Potential Duplicate Detected</strong>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    This candidate appears to have already applied (ID: {candidate.duplicate_of})
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Skill Match Analysis - Progress Bars */}
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📊 AI Skill Match Analysis</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                            {(candidate.skills || []).filter(s => s.matched).slice(0, 10).map((skill, index) => (
                                <div key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>{skill.name}</span>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                            {Math.round(skill.match_score || 0)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar" style={{ height: '6px' }}>
                                        <div 
                                            className="progress-fill" 
                                            style={{ 
                                                width: `${skill.match_score || 0}%`,
                                                background: 'var(--gradient-primary)'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {(!candidate.skills || candidate.skills.filter(s => s.matched).length === 0) && (
                                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', gridColumn: 'span 2' }}>
                                    No direct skill matches detected.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Matched vs Missing Skills */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-xl)'
                    }}>
                        <div>
                            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-success)', fontSize: 'var(--font-size-base)' }}>
                                ✅ Matched Skills
                            </h4>
                            <div className="skills-list">
                                {(candidate.matched_skills || []).map((skill, index) => (
                                    <span key={index} className="skill-tag matched">{skill}</span>
                                ))}
                                {(!candidate.matched_skills || candidate.matched_skills.length === 0) && (
                                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No specific matches found</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-danger)', fontSize: 'var(--font-size-base)' }}>
                                ❌ Missing Skills
                            </h4>
                            <div className="skills-list">
                                {(candidate.missing_skills || []).map((skill, index) => (
                                    <span key={index} className="skill-tag" style={{ borderStyle: 'dashed' }}>{skill}</span>
                                ))}
                                {(!candidate.missing_skills || candidate.missing_skills.length === 0) && (
                                    <span style={{ color: 'var(--accent-success)', fontSize: 'var(--font-size-sm)' }}>Perfect skill alignment!</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Improvement Suggestions */}
                    {candidate.improvement_suggestions?.length > 0 && (
                        <div style={{
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-lg)',
                            background: 'rgba(59, 130, 246, 0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-info)' }}>
                                ✨ AI Improvement Suggestions
                            </h4>
                            <ul style={{ paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                {candidate.improvement_suggestions.map((suggestion, index) => (
                                    <li key={index} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* AI Recommendation & Interview Status */}
                    {candidate.ai_recommendation && (
                        <div style={{
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-lg)',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--accent-primary)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                <h4 style={{ marginBottom: 0, color: 'var(--accent-primary)' }}>
                                    🤖 AI Recommendation
                                </h4>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    {candidate.recommendation_category && (
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 'bold',
                                            padding: '4px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--accent-primary)',
                                            color: 'white'
                                        }}>
                                            {candidate.recommendation_category}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 'bold',
                                        padding: '4px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        background: candidate.match_score > 75 ? 'var(--accent-success)' : 'var(--accent-warning)',
                                        color: 'white'
                                    }}>
                                        Interview: {candidate.match_score > 75 ? 'Recommended' : 'Maybe'}
                                    </span>
                                </div>
                            </div>
                            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', marginTop: 'var(--spacing-sm)' }}>"{candidate.ai_recommendation}"</p>
                        </div>
                    )}

                    {/* Experience & Education - (Kept same but combined or cleaned up if needed) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
                        <div>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>💼 Experience</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {candidate.experience?.slice(0, 3).map((exp, index) => (
                                    <div key={index} style={{ padding: 'var(--spacing-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>{exp.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{exp.company} • {exp.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>🎓 Education</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {candidate.education?.slice(0, 2).map((edu, index) => (
                                    <div key={index} style={{ padding: 'var(--spacing-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>{edu.degree}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{edu.institution}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

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
