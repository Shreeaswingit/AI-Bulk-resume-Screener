import { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import JobDescriptionForm from './components/JobDescriptionForm';
import StatsCards from './components/StatsCards';
import CandidateCard from './components/CandidateCard';
import CandidateModal from './components/CandidateModal';
import ScreeningProgress from './components/ScreeningProgress';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import JobsSection from './components/JobsSection';
import Login from './components/Login';
import * as api from './services/api';
import confetti from 'canvas-confetti';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState(null); // Track API health
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Check API health on mount
  const checkApiHealth = async () => {
    try {
      const health = await api.healthCheck();
      setApiStatus(health);
      if (health.ai_error) {
        setStatusMessage({ type: 'error', text: health.ai_error, persistent: true });
      }
    } catch (error) {
      setApiStatus({ ai_error: 'Backend server not running. Start with: python run.py' });
      setStatusMessage({ type: 'error', text: 'Backend server not running', persistent: true });
    }
  };

  // Load data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('screener_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      checkApiHealth();
      loadCandidates();
      loadStats();
    }
  }, [isLoggedIn]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogin = (username) => {
    const userData = { name: username, loginTime: new Date().toISOString() };
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('screener_user', JSON.stringify(userData));

    // Celebration!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    setStatusMessage({ type: 'success', text: `Welcome back, ${username}! 🎉` });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('screener_user');
    setStatusMessage({ type: 'info', text: 'Logged out successfully' });
  };

  const loadCandidates = async () => {
    try {
      const data = await api.getCandidates();
      const items = data.candidates || [];
      // Sort by score descending to assign ranks
      items.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      items.forEach((c, i) => c.rank = i + 1);
      setCandidates(items);
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
    // Check if there are any candidates to analyze (either just uploaded or existing pending ones)
    const hasCandidates = uploadedFiles.length > 0 || candidates.length > 0;

    if (!hasCandidates) {
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
      setStatusMessage({
        type: 'success',
        text: `Analyzed ${result.total_analyzed} candidates successfully!`
      });
      setProgress({ status: 'complete', progress: 100 });

      // Reload all candidates to ensure we have the full list including previous ones
      await loadCandidates();
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
    let list = candidates;
    if (activeSection === 'shortlisted') {
      list = candidates.filter(c => c.status === 'shortlisted');
    } else if (filter !== 'all') {
      list = candidates.filter(c => c.status === filter);
    }

    if (selectedJobId) {
      list = list.filter(c => c.job_id === selectedJobId);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(c =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.contact?.email || '').toLowerCase().includes(term) ||
        (c.skills || []).some(s => s.name.toLowerCase().includes(term))
      );
    }
    return list.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>
              Welcome to Resume Screener 👋
            </h1>



            <StatsCards stats={stats} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-xl)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <UploadZone
                onFilesSelected={handleFilesSelected}
                isLoading={isUploading}
              />
              <JobDescriptionForm
                onSubmit={handleAnalyze}
                isLoading={isAnalyzing}
              />
            </div>

            {candidates.length > 0 && (
              <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
                <div className="card-header">
                  <h3 className="card-title">🏆 Top Ranking Candidates</h3>
                  <button className="btn btn-ghost" onClick={() => setActiveSection('candidates')}>View All</button>
                </div>
                <div className="candidates-grid">
                  {candidates.slice(0, 3).map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onView={handleViewCandidate}
                      onShortlist={handleShortlist}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'analytics':
        return <AnalyticsDashboard stats={stats} />;

      case 'jobs':
        return <JobsSection onSelectJob={(jobId) => {
          setSelectedJobId(jobId);
          setActiveSection('candidates');
        }} />;

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
                isLoading={isAnalyzing}
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
                {activeSection === 'shortlisted' ? 'Shortlisted Candidates ⭐' : 
                 selectedJobId ? `Candidates for ${candidates.find(c => c.job_id === selectedJobId)?.job_title || 'Position'} 👥` :
                 'All Candidates 👥'}
              </h1>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                {selectedJobId && (
                  <button className="btn btn-secondary" onClick={() => setSelectedJobId(null)}>
                    ⬅ Back to All
                  </button>
                )}
                {activeSection === 'candidates' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search candidates or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '40px', width: '300px' }}
                    />
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {['all', 'analyzed', 'shortlisted', 'rejected'].map((f) => (
                      <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(f)}
                        style={{ textTransform: 'capitalize', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  </div>
                )}
              </div>
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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
        user={user}
      />

      <main className="main-content">
        {/* Celebration Header - Only shown after login briefly */}
        {user && !user.hideWelcome && (
          <div style={{
            padding: 'var(--spacing-md) var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)',
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeInDown 0.8s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{ fontSize: '24px' }}>✨</span>
              <span style={{ fontWeight: '600' }}>Welcome, {user.name}! Ready to screen some resumes today?</span>
            </div>
            <button
              className="btn btn-ghost"
              style={{ color: 'white', padding: 'var(--spacing-xs)' }}
              onClick={() => setUser({ ...user, hideWelcome: true })}
            >
              ✕
            </button>
          </div>
        )}
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
