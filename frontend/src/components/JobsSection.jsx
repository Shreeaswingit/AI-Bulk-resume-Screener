import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Edit2, Trash2, Save, X, RefreshCw, Briefcase } from 'lucide-react';

const JobsSection = ({ onSelectJob }) => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingJobId, setEditingJobId] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '' });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setIsLoading(true);
        try {
            const data = await api.getJobs();
            setJobs(data.jobs || []);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e, jobId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this job? Associated candidates will be un-linked.')) {
            try {
                await api.deleteJob(jobId);
                setJobs(jobs.filter(j => j.id !== jobId));
            } catch (error) {
                console.error('Failed to delete job:', error);
                alert('Failed to delete job');
            }
        }
    };

    const startEdit = (e, job) => {
        e.stopPropagation();
        setEditingJobId(job.id);
        setEditData({ title: job.title, description: job.description });
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingJobId(null);
    };

    const handleUpdate = async (e, jobId) => {
        e.stopPropagation();
        try {
            await api.updateJob(jobId, editData);
            setJobs(jobs.map(j => j.id === jobId ? { ...j, ...editData } : j));
            setEditingJobId(null);
        } catch (error) {
            console.error('Failed to update job:', error);
            alert('Failed to update job');
        }
    };

    if (isLoading && jobs.length === 0) {
        return <div className="loading" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <RefreshCw className="animate-spin" style={{ margin: '0 auto' }} />
            <p>Loading jobs...</p>
        </div>;
    }

    return (
        <div className="jobs-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1>Manage by Job Title 💼</h1>
                <button className="btn btn-secondary" onClick={loadJobs} title="Refresh list">
                    <RefreshCw size={18} />
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>📁</div>
                    <h3>No job postings found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Upload resumes with a job description to create your first posting.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-xl)' }}>
                    {jobs.map((job) => (
                        <div key={job.id} className="card job-card" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            transition: 'all 0.3s ease',
                            border: editingJobId === job.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            boxShadow: editingJobId === job.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                        }}>
                            {editingJobId === job.id ? (
                                <div style={{ padding: 'var(--spacing-lg)' }}>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>Job Title</label>
                                        <input 
                                            className="form-input"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>Description</label>
                                        <textarea 
                                            className="form-input"
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                        <button className="btn btn-primary" onClick={(e) => handleUpdate(e, job.id)} style={{ flex: 1 }}>
                                            <Save size={16} style={{ marginRight: '8px' }} /> Save
                                        </button>
                                        <button className="btn btn-secondary" onClick={cancelEdit}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => onSelectJob(job.id)} style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div className="card-header" style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'flex-start',
                                        borderBottom: '1px solid var(--bg-tertiary)', 
                                        padding: 'var(--spacing-md) var(--spacing-lg)' 
                                    }}>
                                        <div>
                                            <h3 className="card-title" style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}>{job.title}</h3>
                                            <span style={{ 
                                                fontSize: 'var(--font-size-xs)', 
                                                color: 'var(--text-muted)'
                                            }}>
                                                Posted on {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                            <button 
                                                className="btn-icon" 
                                                onClick={(e) => startEdit(e, job)}
                                                style={{ padding: '4px', color: 'var(--text-secondary)' }}
                                                title="Edit Job"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="btn-icon delete-btn" 
                                                onClick={(e) => handleDelete(e, job.id)}
                                                style={{ padding: '4px', color: 'var(--accent-danger)' }}
                                                title="Delete Job"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="card-body" style={{ flex: 1, padding: 'var(--spacing-lg)' }}>
                                        <p style={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            color: 'var(--text-secondary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: 'var(--spacing-lg)',
                                            lineHeight: '1.5'
                                        }}>
                                            {job.description}
                                        </p>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="stat-mini">
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Candidates</div>
                                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>{job.candidate_count}</div>
                                            </div>
                                            <div className="stat-mini" style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Avg Score</div>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-lg)', 
                                                    fontWeight: 'bold', 
                                                    color: job.avg_score > 70 ? 'var(--accent-success)' : 'var(--accent-warning)' 
                                                }}>
                                                    {Math.round(job.avg_score)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="card-footer" style={{ borderTop: '1px solid var(--bg-tertiary)', padding: 'var(--spacing-md) var(--spacing-lg)' }}>
                                        <button className="btn btn-ghost w-full" style={{ justifyContent: 'center' }}>
                                            View Candidates →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobsSection;
