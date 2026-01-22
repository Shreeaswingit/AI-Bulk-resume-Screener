import { useState, useRef } from 'react';

export default function UploadZone({ onFilesSelected, isLoading }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(
            file => file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc')
        );
        if (files.length > 0) {
            setSelectedFiles(files);
            onFilesSelected(files);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            onFilesSelected(files);
        }
    };

    return (
        <div className="card animate-slideUp">
            <div className="card-header">
                <h3 className="card-title">📤 Upload Resumes</h3>
                {selectedFiles.length > 0 && (
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {selectedFiles.length} file(s) selected
                    </span>
                )}
            </div>

            <div
                className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <div className="upload-icon">
                    {isLoading ? '⏳' : '📁'}
                </div>

                <h4 className="upload-title">
                    {isLoading ? 'Uploading...' : 'Drop resumes here or click to browse'}
                </h4>

                <p className="upload-subtitle">
                    Supports PDF and DOCX files • Multiple files allowed
                </p>
            </div>

            {selectedFiles.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--spacing-sm)'
                    }}>
                        Selected files:
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-sm)'
                    }}>
                        {selectedFiles.map((file, index) => (
                            <span key={index} className="skill-tag">
                                📄 {file.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
