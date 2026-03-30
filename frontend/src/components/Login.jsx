import React, { useState } from 'react';
import { Lock, User, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import './Login.css';

import * as api from '../services/api';

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                await api.register(username, password, fullName || username);
                setIsRegistering(false);
                setError('Account created! Please login.');
            } else {
                const data = await api.login(username, password);
                onLogin(data.user.username);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Sparkles size={32} color="white" />
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Enter your credentials to access the Resume Screener</p>
                    </div>
                    <form onSubmit={handleSubmit} className="login-form">
                        {isRegistering && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-with-icon">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={isRegistering}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="your_id"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className={`login-error ${error.includes('created') ? 'success' : ''}`}>
                                <ShieldCheck size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    <LogIn size={18} />
                                    <span>{isRegistering ? 'Create Account' : 'Login to Dashboard'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'var(--accent-primary)', textDecoration: 'underline', marginBottom: '10px' }}>
                            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                        </p>
                        <p>© 2026 AI Resume Screener Pro</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;
