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

export default function AnalyticsDashboard({ stats }) {
    if (!stats || Object.keys(stats).length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <h3>No data available yet</h3>
                <p>Upload and analyze resumes to see analytics</p>
            </div>
        );
    }

    const pieData = [
        { name: 'Analyzed', value: stats.analyzed || 0, color: 'var(--accent-info)' },
        { name: 'Shortlisted', value: stats.shortlisted || 0, color: 'var(--accent-warning)' },
        { name: 'Rejected', value: stats.rejected || 0, color: 'var(--accent-danger)' },
        { name: 'Pending', value: stats.pending || 0, color: 'var(--text-muted)' }
    ].filter(item => item.value > 0);

    return (
        <div className="analytics-container">
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Analytics Overview 📊</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--spacing-xl)'
            }}>
                {/* Status Distribution */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Resume Status Distribution</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Candidates */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Top 5 Candidates</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={stats.top_candidates || []}
                                layout="vertical"
                                margin={{ left: 40, right: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={100} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: 'none' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Bar dataKey="score" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Demand */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Skill Demand (Top 10)</h4>
                    <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.top_skills || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: 'none' }}
                                />
                                <Bar dataKey="count" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
