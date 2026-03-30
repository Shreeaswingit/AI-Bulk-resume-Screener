import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Star, Briefcase, Award, Zap, TrendingUp, Calendar, Trash2 } from 'lucide-react';

export default function ShortlistedView() {
    const [shortlisted, setShortlisted] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadShortlisted();
    }, []);

    const loadShortlisted = async () => {
        setIsLoading(true);
        try {
            const data = await api.getShortlistedCandidates();
            setShortlisted(data.shortlisted || []);
        } catch (err) {
            setError('Failed to load shortlisted candidates');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loader"></div>
                <span style={{ marginLeft: 'var(--spacing-md)' }}>Fetching shortlisted alumni...</span>
            </div>
        );
    }

    if (shortlisted.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>⭐</div>
                <h2 style={{ marginBottom: 'var(--spacing-md)' }}>No Shortlisted Candidates Yet</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                    Candidates you shortlist during screening will appear here permanently, 
                    saved securely in the database with their full analytics.
                </p>
            </div>
        );
    }

    return (
        <div className="shortlisted-container">
            <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Shortlisted Talent Pool ⭐</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Verified high-potential candidates saved in database</p>
                </div>
                <div className="badge badge-primary" style={{ padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: '16px' }}>
                    {shortlisted.length} Candidates
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                {shortlisted.map((c) => (
                    <div key={c.id} className="card shortlisted-card" style={{ 
                        borderLeft: '5px solid var(--accent-primary)',
                        padding: '0',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        animation: 'fadeInUp 0.5s ease-out both'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {/* Candidate Summary Sidebar */}
                            <div style={{ 
                                flex: '1 1 300px', 
                                padding: 'var(--spacing-xl)', 
                                background: 'var(--bg-secondary)',
                                borderRight: '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%', 
                                        background: 'var(--gradient-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                    }}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{c.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '600' }}>
                                            <Briefcase size={14} />
                                            {c.job_title}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    <div className="stat-item">
                                        <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Match Score</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${c.match_score}%`, 
                                                    height: '100%', 
                                                    background: c.match_score > 80 ? 'var(--accent-success)' : 'var(--accent-primary)' 
                                                }}></div>
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{Math.round(c.match_score)}%</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                                        <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Shortlisted On</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                            <Calendar size={14} />
                                            {new Date(c.shortlisted_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Analytics */}
                            <div style={{ flex: '2 2 500px', padding: 'var(--spacing-xl)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-xl)' }}>
                                    {/* Key Strengths */}
                                    <div className="analytics-section">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', color: 'var(--accent-success)' }}>
                                            <Zap size={18} />
                                            <h4 style={{ margin: 0 }}>Key Strong Areas</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                            {c.key_strengths.split(',').map((skill, idx) => (
                                                <span key={idx} className="badge badge-success" style={{ fontSize: '12px' }}>
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Why Shortlisted */}
                                    <div className="analytics-section">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', color: 'var(--accent-warning)' }}>
                                            <Award size={18} />
                                            <h4 style={{ margin: 0 }}>Shortlist Rationale</h4>
                                        </div>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                                            {c.why_shortlisted}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ 
                                    marginTop: 'var(--spacing-xl)', 
                                    padding: 'var(--spacing-md)', 
                                    background: 'var(--bg-tertiary)', 
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Experience</span>
                                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                                                {c.analytics_json?.total_experience || 'N/A'} Years
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matched Skills</span>
                                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                                                {c.analytics_json?.matched_skills?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: '13px' }}>
                                        View Full Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .shortlisted-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
