export default function ScreeningProgress({ progress }) {
    const steps = [
        { id: 'upload', label: 'Upload', icon: '📤' },
        { id: 'parsing', label: 'Parsing', icon: '📄' },
        { id: 'analyzing', label: 'AI Analysis', icon: '🤖' },
        { id: 'scoring', label: 'Scoring', icon: '📊' },
        { id: 'complete', label: 'Complete', icon: '✅' }
    ];

    const getCurrentStepIndex = () => {
        if (progress.status === 'complete') return 4;
        if (progress.status === 'idle') return -1;

        const stepMap = {
            'parsing': 1,
            'analyzing': 2,
            'scoring': 3
        };
        return stepMap[progress.step] || 1;
    };

    const currentStepIndex = getCurrentStepIndex();

    if (progress.status === 'idle') return null;

    return (
        <div className="card screening-progress animate-slideUp">
            <div className="card-header">
                <h3 className="card-title">🔄 Screening Progress</h3>
                {progress.current_file && (
                    <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)'
                    }}>
                        Processing: {progress.current_file}
                    </span>
                )}
            </div>

            <div className="progress-steps">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`progress-step ${index < currentStepIndex ? 'completed' :
                                index === currentStepIndex ? 'active' : ''
                            }`}
                    >
                        <div className="step-icon">
                            {index < currentStepIndex ? '✓' : step.icon}
                        </div>
                        <span className="step-label">{step.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-sm)',
                    fontSize: 'var(--font-size-sm)'
                }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {progress.progress || 0}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress.progress || 0}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
