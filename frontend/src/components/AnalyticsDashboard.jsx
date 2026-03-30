import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { 
    Users, 
    Zap, 
    AlertCircle, 
    Target, 
    TrendingUp, 
    Award,
    ShieldCheck,
    HelpCircle,
    Info
} from 'lucide-react';

export default function AnalyticsDashboard({ stats }) {
    if (!stats || Object.keys(stats).length === 0 || stats.total === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>📊</div>
                <h3>Awaiting Your First Screening</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    Once you upload resumes and complete an analysis, your recruitment story will appear here with deep data insights.
                </p>
            </div>
        );
    }

    const { insights = {} } = stats;
    const pieData = [
        { name: 'Shortlisted', value: stats.shortlisted || 0, color: 'var(--accent-warning)', desc: 'Top tier talent pool' },
        { name: 'Rejected', value: stats.rejected || 0, color: 'var(--accent-danger)', desc: 'Not a match for current criteria' },
        { name: 'Analyzed', value: stats.analyzed || 0, color: 'var(--accent-info)', desc: 'Profiles reviewed but not yet finalized' },
        { name: 'Pending', value: stats.pending || 0, color: 'var(--text-muted)', desc: 'Awaiting AI deep-dive' }
    ].filter(item => item.value > 0);

    return (
        <div className="analytics-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Recruitment Narrative 📈</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Deep-dive intelligence for the <strong>{insights.job_title}</strong> role analysis.
                    </p>
                </div>
                <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
                    <Users size={16} />
                    {stats.total} Resumes Scanned
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: 'var(--spacing-xl)'
            }}>
                {/* Status Narrative Card */}
                <div className="card" style={{ GridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
                        <Target size={20} className="text-primary" />
                        <h4 style={{ margin: 0 }}>Analysis Breakdown</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
                        <div style={{ height: '240px', width: '200px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: 'white' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {pieData.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: item.color }}></div>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name} ({item.value})</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '20px' }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ 
                        marginTop: 'var(--spacing-md)', 
                        padding: 'var(--spacing-md)', 
                        background: 'var(--bg-tertiary)', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Info size={16} color="var(--accent-info)" />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                            We analyzed {stats.analyzed} profiles for the <strong>{insights.job_title}</strong> role, focusing on skill match and experience relevance.
                        </p>
                    </div>
                </div>

                {/* Winners Narrative (Shortlisted) */}
                <div className="card" style={{ borderTop: '4px solid var(--accent-warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
                        <Award size={20} color="var(--accent-warning)" />
                        <h4 style={{ margin: 0 }}>The Shortlist Story</h4>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Why these candidates won: Our AI identified consistent excellence in these core strength areas:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {insights.common_strengths && insights.common_strengths.length > 0 ? (
                            insights.common_strengths.map(([name, count], idx) => (
                                <div key={idx} className="stat-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <ShieldCheck size={16} color="var(--accent-success)" />
                                        <span style={{ fontSize: '14px' }}>{name}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px' }}>
                                        {count} candidates
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                                Not enough shortlisted data to derive common patterns yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Rejection Narrative (Learners) */}
                <div className="card" style={{ borderTop: '4px solid var(--accent-danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
                        <AlertCircle size={20} color="var(--accent-danger)" />
                        <h4 style={{ margin: 0 }}>The Rejection Story</h4>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        The most frequent gaps found in rejected or low-ranking profiles that didn't meet criteria:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {insights.common_missing_skills && insights.common_missing_skills.length > 0 ? (
                            insights.common_missing_skills.map(([name, count], idx) => (
                                <div key={idx} style={{ marginBottom: 'var(--spacing-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '13px' }}>{name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--accent-danger)' }}>{Math.round((count/stats.total)*100)}% Gaps</span>
                                    </div>
                                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '3px' }}>
                                        <div style={{ height: '100%', width: `${(count/stats.total)*100}%`, background: 'var(--accent-danger)', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                                No significant gaps detected across the candidate pool.
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Velocity */}
                <div className="card" style={{ gridColumn: 'span 1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
                        <TrendingUp size={20} color="var(--accent-primary)" />
                        <h4 style={{ margin: 0 }}>Score Distribution</h4>
                    </div>
                    <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={stats.top_candidates || []}
                                margin={{ left: -20, right: 30, top: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickCount={5} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }}
                                />
                                <Bar dataKey="score" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={40}>
                                    { (stats.top_candidates || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'var(--accent-success)' : 'var(--accent-primary)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Average Match Score: <strong style={{ color: 'var(--text-primary)' }}>{stats.average_score}%</strong>
                    </div>
                </div>

                {/* Skill Cloud Card */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={20} color="var(--accent-secondary)" />
                            <h4 style={{ margin: 0 }}>Global Skill Landscape</h4>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Heatmap of top 10 identified skills</div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.top_skills || []} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--text-muted)" 
                                    fontSize={12} 
                                    angle={-45} 
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .card { animation: fadeIn 0.8s ease-out backwards; }
                .card:nth-child(2) { animation-delay: 0.1s; }
                .card:nth-child(3) { animation-delay: 0.2s; }
                .card:nth-child(4) { animation-delay: 0.3s; }
                .card:nth-child(5) { animation-delay: 0.4s; }
            `}} />
        </div>
    );
}
