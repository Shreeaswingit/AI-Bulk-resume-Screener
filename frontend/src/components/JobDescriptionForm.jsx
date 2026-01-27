import { useState } from 'react';

export default function JobDescriptionForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        preferredSkills: '',
        minExperience: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const jobDescription = {
            title: formData.title,
            description: formData.description,
            required_skills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            preferred_skills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
            min_experience_years: formData.minExperience ? parseFloat(formData.minExperience) : null
        };

        if (onSubmit) {
            onSubmit(jobDescription);
        }
    };

    const parseSkills = (skillsStr) => {
        return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    };

    return (
        <div className="card animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
                <h3 className="card-title">📝 Job Description</h3>
            </div>



            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Job Description *</label>
                    <textarea
                        name="description"
                        className="form-textarea"
                        placeholder="Describe the role, responsibilities, and ideal candidate..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Required Skills (comma-separated) *</label>
                    <input
                        type="text"
                        name="requiredSkills"
                        className="form-input"
                        placeholder="e.g., Python, React, AWS, PostgreSQL"
                        value={formData.requiredSkills}
                        onChange={handleChange}
                        required
                    />
                    {formData.requiredSkills && (
                        <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                            {parseSkills(formData.requiredSkills).map((skill, i) => (
                                <span key={i} className="skill-tag matched">{skill}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Preferred Skills (comma-separated)</label>
                    <input
                        type="text"
                        name="preferredSkills"
                        className="form-input"
                        placeholder="e.g., Docker, Kubernetes, GraphQL"
                        value={formData.preferredSkills}
                        onChange={handleChange}
                    />
                    {formData.preferredSkills && (
                        <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                            {parseSkills(formData.preferredSkills).map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Minimum Years of Experience</label>
                    <input
                        type="number"
                        name="minExperience"
                        className="form-input"
                        placeholder="e.g., 3"
                        min="0"
                        step="0.5"
                        value={formData.minExperience}
                        onChange={handleChange}
                        style={{ maxWidth: '150px' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !formData.title || !formData.description || !formData.requiredSkills}
                    style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                >
                    {isLoading ? (
                        <>⏳ Analyzing Resumes...</>
                    ) : (
                        <>🔍 Start Screening</>
                    )}
                </button>
            </form>
        </div>
    );
}
