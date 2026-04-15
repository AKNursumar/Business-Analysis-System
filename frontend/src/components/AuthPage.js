import React, { useState } from 'react';
import authService from '../services/authService';
import './AuthPage.css';

/**
 * Authentication page with login and signup tabs
 */
const AuthPage = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  // Handle login form change
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Handle signup form change
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.login(loginForm.username, loginForm.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onAuthSuccess();
      }, 1000);
    } catch (err) {
      setError(
        typeof err === 'object' && err.detail
          ? err.detail
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (signupForm.password !== signupForm.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authService.signup(
        signupForm.username,
        signupForm.email,
        signupForm.password,
        signupForm.password2
      );
      setSuccess('Account created! Logging in...');
      
      // Auto-login after signup
      await authService.login(signupForm.username, signupForm.password);
      setTimeout(() => {
        onAuthSuccess();
      }, 1000);
    } catch (err) {
      if (typeof err === 'object') {
        const errorMessages = Object.values(err)
          .flat()
          .join(', ');
        setError(errorMessages || 'Signup failed');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Business Analysis System</h1>
        
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccess('');
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={signupForm.username}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={signupForm.email}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={signupForm.password}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password2">Confirm Password</label>
              <input
                id="signup-password2"
                type="password"
                name="password2"
                placeholder="Confirm your password"
                value={signupForm.password2}
                onChange={handleSignupChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
