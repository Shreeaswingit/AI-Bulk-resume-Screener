import React, { useState } from 'react';
import { Lock, User, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                onLogin(username);
            } else {
                setError('Invalid credentials. Please use admin/admin');
                setIsLoading(false);
            }
        }, 1000);
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
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="admin"
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
                            <div className="login-error">
                                <ShieldCheck size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : (
                                <>
                                    <LogIn size={18} />
                                    <span>Login to Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>© 2026 AI Resume Screener Pro</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;
