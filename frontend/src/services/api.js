const API_BASE = 'http://localhost:8000/api';

// Upload resumes
export async function uploadResumes(files) {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

// Analyze resumes with job description
export async function analyzeResumes(jobDescription, resumeIds = null, job_id = null) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_id: job_id,
      job_description: jobDescription,
      resume_ids: resumeIds,
    }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}

// Get all candidates
export async function getCandidates(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.minScore) params.append('min_score', filters.minScore);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`${API_BASE}/candidates?${params}`);
  return response.json();
}

// Get single candidate
export async function getCandidate(candidateId) {
  const response = await fetch(`${API_BASE}/candidates/${candidateId}`);
  return response.json();
}

// Shortlist candidate
export async function shortlistCandidate(candidateId) {
  const response = await fetch(`${API_BASE}/candidates/${candidateId}/shortlist`, {
    method: 'POST',
  });
  return response.json();
}

// Get all shortlisted candidates from database
export async function getShortlistedCandidates() {
  const response = await fetch(`${API_BASE}/shortlisted`);
  if (!response.ok) {
    throw new Error('Failed to fetch shortlisted candidates');
  }
  return response.json();
}

// Reject candidate
export async function rejectCandidate(candidateId) {
  const response = await fetch(`${API_BASE}/candidates/${candidateId}/reject`, {
    method: 'POST',
  });
  return response.json();
}

// Get screening progress
export async function getProgress() {
  const response = await fetch(`${API_BASE}/progress`);
  return response.json();
}

// Get statistics
export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`);
  return response.json();
}

// Get all jobs
export async function getJobs() {
  const response = await fetch(`${API_BASE}/jobs`);
  return response.json();
}

// Get candidates for a specific job
export async function getJobCandidates(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/candidates`);
  return response.json();
}

// Update job details
export async function updateJob(jobId, updates) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

// Delete a job
export async function deleteJob(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Clear all candidates
export async function clearCandidates() {
  const response = await fetch(`${API_BASE}/candidates`, {
    method: 'DELETE',
  });
  return response.json();
}

// Save job description
export async function saveJobDescription(jobDescription) {
  const response = await fetch(`${API_BASE}/job-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobDescription),
  });
  return response.json();
}

// Auth
export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  return response.json();
}

export async function register(username, password, full_name) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, full_name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }
  return response.json();
}

// Health check
export async function healthCheck() {
  const response = await fetch('http://localhost:8000/health');
  return response.json();
}
