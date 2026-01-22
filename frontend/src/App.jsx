import { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import JobDescriptionForm from './components/JobDescriptionForm';
import StatsCards from './components/StatsCards';
import CandidateCard from './components/CandidateCard';
import CandidateModal from './components/CandidateModal';
import ScreeningProgress from './components/ScreeningProgress';
import * as api from './services/api';
import { analyzeResumeWithPuter } from './services/puterAI';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({});
  const [progress, setProgress] = useState({ status: 'idle', progress: 0 });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileContents, setFileContents] = useState({}); // Store file text for Puter AI
  const [statusMessage, setStatusMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [usePuterAI, setUsePuterAI] = useState(true); // Default to free Puter AI

  // Load data on mount
  useEffect(() => {
    loadCandidates();
    loadStats();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadCandidates = async () => {
    try {
      const data = await api.getCandidates();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Read file as text for Puter AI analysis
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;

      // For PDFs and DOCX, we need to send to backend first or use arraybuffer
      if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        // Read as text - backend will parse
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFilesSelected = async (files) => {
    setIsUploading(true);
    setStatusMessage({ type: 'info', text: `Uploading ${files.length} files...` });

    try {
      // Upload to backend (for storage and parsing)
      const result = await api.uploadResumes(files);
      setUploadedFiles(result.candidates || []);

      // Store file references for Puter AI
      const contents = {};
      for (const file of files) {
        contents[file.name] = file;
      }
      setFileContents(contents);

      setStatusMessage({
        type: 'success',
        text: `Uploaded ${result.successful} files successfully!`
      });
      await loadStats();
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Failed to upload files' });
    } finally {
      setIsUploading(false);
    }
  };

  // Backend Gemini analysis
  const handleAnalyze = async (jobDescription) => {
    if (uploadedFiles.length === 0 && candidates.filter(c => c.status === 'pending').length === 0) {
      setStatusMessage({ type: 'error', text: 'Please upload resumes first' });
      return;
    }

    setIsAnalyzing(true);
    setProgress({ status: 'analyzing', progress: 0, step: 'parsing' });
    setActiveSection('candidates');

    // Poll for progress
    const progressInterval = setInterval(async () => {
      try {
        const progressData = await api.getProgress();
        setProgress(progressData);
        if (progressData.status === 'complete' || progressData.status === 'idle') {
          clearInterval(progressInterval);
        }
      } catch (error) {
        console.error('Progress check failed:', error);
      }
    }, 1000);

    try {
      const result = await api.analyzeResumes(jobDescription);
      setCandidates(result.candidates || []);
      setStatusMessage({
        type: 'success',
        text: `Analyzed ${result.total_analyzed} candidates successfully!`
      });
      setProgress({ status: 'complete', progress: 100 });
      await loadStats();
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Analysis failed. Is the backend running with Gemini API key?' });
      setProgress({ status: 'idle', progress: 0 });
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress({ status: 'idle', progress: 0 }), 3000);
    }
  };

  // FREE Puter.js AI analysis
  const handleAnalyzePuter = async (jobDescription) => {
    if (uploadedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please upload resumes first' });
      return;
    }

    setIsAnalyzing(true);
    setProgress({ status: 'analyzing', progress: 0, step: 'parsing', current_file: '' });
    setActiveSection('candidates');

    const analyzedCandidates = [];
    const total = uploadedFiles.length;

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const candidate = uploadedFiles[i];

        setProgress({
          status: 'analyzing',
          progress: Math.round((i / total) * 100),
          step: 'analyzing',
          current_file: candidate.filename
        });

        // Get resume text from backend (it already parsed the file)
        let resumeText = '';
        try {
          const candidateData = await api.getCandidate(candidate.id);
          // If we have summary from previous analysis, use basic info
          resumeText = `Candidate from file: ${candidate.filename}`;

          // For Puter AI, we'll send the filename and let backend parse
          // Or we can use the raw file we stored
          const file = fileContents[candidate.filename];
          if (file) {
            try {
              resumeText = await readFileAsText(file);
            } catch (e) {
              console.log('Could not read file as text, using filename');
            }
          }
        } catch (e) {
          resumeText = `Resume file: ${candidate.filename}`;
        }

        try {
          // Analyze with Puter.js FREE AI
          const analysis = await analyzeResumeWithPuter(resumeText, jobDescription);

          const analyzedCandidate = {
            ...candidate,
            id: candidate.id,
            name: analysis.name || 'Unknown',
            filename: candidate.filename,
            status: 'analyzed',
            contact: analysis.contact || {},
            summary: analysis.summary || '',
            skills: (analysis.skills || []).map(s => ({
              name: s.name,
              proficiency: s.proficiency,
              years: s.years,
              matched: s.matched || false
            })),
            experience: analysis.experience || [],
            education: analysis.education || [],
            total_experience_years: analysis.total_experience_years || 0,
            strengths: analysis.strengths || [],
            concerns: analysis.concerns || [],
            match_score: analysis.match_score || 0,
            skill_match_percentage: analysis.skill_match_percentage || 0,
            ai_recommendation: analysis.ai_recommendation || ''
          };

          analyzedCandidates.push(analyzedCandidate);
        } catch (error) {
          console.error(`Failed to analyze ${candidate.filename}:`, error);
          analyzedCandidates.push({
            ...candidate,
            status: 'analyzed',
            concerns: ['AI analysis failed for this resume'],
            match_score: 0
          });
        }
      }

      // Sort by match score
      analyzedCandidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      setCandidates(analyzedCandidates);
      setStats({
        total: analyzedCandidates.length,
        analyzed: analyzedCandidates.length,
        shortlisted: 0,
        rejected: 0,
        average_score: analyzedCandidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / analyzedCandidates.length || 0
      });

      setStatusMessage({
        type: 'success',
        text: `Analyzed ${analyzedCandidates.length} candidates with FREE AI!`
      });
      setProgress({ status: 'complete', progress: 100 });

    } catch (error) {
      console.error('Puter AI analysis failed:', error);
      setStatusMessage({ type: 'error', text: 'Analysis failed. Please try again.' });
      setProgress({ status: 'idle', progress: 0 });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress({ status: 'idle', progress: 0 }), 3000);
    }
  };

  const handleShortlist = async (candidateId) => {
    // Update local state for Puter mode
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, status: 'shortlisted' } : c
    ));
    setStats(prev => ({
      ...prev,
      shortlisted: (prev.shortlisted || 0) + 1
    }));
    setStatusMessage({ type: 'success', text: 'Candidate shortlisted!' });

    // Also try to update backend
    try {
      await api.shortlistCandidate(candidateId);
    } catch (error) {
      console.log('Backend update skipped');
    }
  };

  const handleReject = async (candidateId) => {
    // Update local state for Puter mode
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, status: 'rejected' } : c
    ));
    setStats(prev => ({
      ...prev,
      rejected: (prev.rejected || 0) + 1
    }));
    setStatusMessage({ type: 'success', text: 'Candidate rejected' });

    // Also try to update backend
    try {
      await api.rejectCandidate(candidateId);
    } catch (error) {
      console.log('Backend update skipped');
    }
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const getFilteredCandidates = () => {
    let filtered = candidates;

    if (activeSection === 'shortlisted') {
      filtered = candidates.filter(c => c.status === 'shortlisted');
    } else if (filter !== 'all') {
      filtered = candidates.filter(c => c.status === filter);
    }

    return filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>
              Welcome to Resume Screener 👋
            </h1>

            {/* Free AI Banner */}
            {usePuterAI && (
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)'
              }}>
                <span style={{ fontSize: '24px' }}>🆓</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--accent-success)' }}>
                    Free AI Mode Enabled
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Powered by Puter.js - No API key required! Using Claude Sonnet 4.
                  </div>
                </div>
              </div>
            )}

            <StatsCards stats={stats} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--spacing-xl)'
            }}>
              <UploadZone
                onFilesSelected={handleFilesSelected}
                isLoading={isUploading}
              />
              <JobDescriptionForm
                onSubmit={handleAnalyze}
                onSubmitPuter={handleAnalyzePuter}
                isLoading={isAnalyzing}
                usePuterAI={usePuterAI}
                onToggleAIMode={() => setUsePuterAI(!usePuterAI)}
              />
            </div>
          </>
        );

      case 'upload':
        return (
          <>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Upload Resumes 📤</h1>
            <UploadZone
              onFilesSelected={handleFilesSelected}
              isLoading={isUploading}
            />
            <div style={{ marginTop: 'var(--spacing-xl)' }}>
              <JobDescriptionForm
                onSubmit={handleAnalyze}
                onSubmitPuter={handleAnalyzePuter}
                isLoading={isAnalyzing}
                usePuterAI={usePuterAI}
                onToggleAIMode={() => setUsePuterAI(!usePuterAI)}
              />
            </div>
          </>
        );

      case 'candidates':
      case 'shortlisted':
        const filteredCandidates = getFilteredCandidates();
        return (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <h1>
                {activeSection === 'shortlisted' ? 'Shortlisted Candidates ⭐' : 'All Candidates 👥'}
              </h1>
              {activeSection === 'candidates' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  {['all', 'analyzed', 'shortlisted', 'rejected'].map((f) => (
                    <button
                      key={f}
                      className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setFilter(f)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {progress.status !== 'idle' && (
              <ScreeningProgress progress={progress} />
            )}

            {filteredCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>
                  {activeSection === 'shortlisted' ? '⭐' : '📄'}
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
                  {activeSection === 'shortlisted'
                    ? 'No shortlisted candidates yet'
                    : 'No candidates found'}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {activeSection === 'shortlisted'
                    ? 'Start screening resumes and shortlist your top candidates'
                    : 'Upload resumes and start screening to see candidates here'}
                </p>
              </div>
            ) : (
              <div className="candidates-grid">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onView={handleViewCandidate}
                    onShortlist={handleShortlist}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </>
        );

      case 'settings':
        return (
          <>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Settings ⚙️</h1>
            <div className="card">
              <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>General Settings</h4>

              {/* AI Mode Setting */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md) 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {usePuterAI ? '🆓 Free AI Mode (Puter.js)' : '🔧 Backend AI (Gemini)'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    {usePuterAI
                      ? 'Using Claude via Puter.js - No API key needed!'
                      : 'Using Gemini API - Requires backend configuration'}
                  </div>
                </div>
                <div
                  className="theme-toggle"
                  onClick={() => setUsePuterAI(!usePuterAI)}
                  style={{ background: usePuterAI ? 'var(--accent-success)' : 'var(--bg-tertiary)' }}
                >
                  <div
                    className="theme-toggle-knob"
                    style={{
                      transform: usePuterAI ? 'translateX(28px)' : 'translateX(0)',
                      background: usePuterAI ? 'white' : 'var(--gradient-primary)'
                    }}
                  ></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md) 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Dark Mode</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    Toggle between dark and light theme
                  </div>
                </div>
                <div className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                  <div className="theme-toggle-knob"></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md) 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Clear All Data</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    Remove all uploaded resumes and analysis results
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (confirm('Are you sure you want to clear all data?')) {
                      try {
                        await api.clearCandidates();
                      } catch (e) { }
                      setCandidates([]);
                      setUploadedFiles([]);
                      setFileContents({});
                      setStats({ total: 0, analyzed: 0, shortlisted: 0, rejected: 0, average_score: 0 });
                      setStatusMessage({ type: 'success', text: 'All data cleared' });
                    }
                  }}
                >
                  Clear Data
                </button>
              </div>

              {/* Puter.js Info */}
              <div style={{
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-lg)',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--accent-success)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--accent-success)' }}>
                  🆓 Free AI via Puter.js
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  This app uses <a href="https://puter.com" target="_blank" rel="noopener" style={{ color: 'var(--accent-success)' }}>Puter.js</a> for
                  free AI-powered resume analysis. No API keys needed!
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
                  Powered by Claude Sonnet 4 • Free for personal use
                </p>
              </div>

              {/* Backend Config (for advanced users) */}
              <div style={{
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-lg)',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 'var(--radius-md)'
              }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                  🔧 Backend Configuration (Optional)
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  For backend Gemini API, configure in <code>backend/.env</code>:
                </p>
                <code style={{
                  display: 'block',
                  padding: 'var(--spacing-md)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: 'var(--spacing-sm)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  GEMINI_API_KEY=your_api_key_here
                </code>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
      />

      <main className="main-content">
        {/* Status Message Toast */}
        {statusMessage && (
          <div
            style={{
              position: 'fixed',
              top: 'var(--spacing-xl)',
              right: 'var(--spacing-xl)',
              padding: 'var(--spacing-md) var(--spacing-xl)',
              background: statusMessage.type === 'error'
                ? 'var(--accent-danger)'
                : statusMessage.type === 'success'
                  ? 'var(--accent-success)'
                  : 'var(--accent-info)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1001,
              animation: 'slideIn var(--transition-base) ease-out'
            }}
            onClick={() => setStatusMessage(null)}
          >
            {statusMessage.text}
          </div>
        )}

        {renderContent()}

        <CandidateModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCandidate(null);
          }}
          onShortlist={handleShortlist}
          onReject={handleReject}
        />
      </main>
    </div>
  );
}

export default App;
