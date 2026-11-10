import { useState } from 'react';
import axios from 'axios';

function BastionMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 72" fill="none" aria-hidden="true">
      <path d="M32 4 55 13v19c0 16-9.4 27.1-23 36C18.4 59.1 9 48 9 32V13L32 4Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 19.5 32 13l16 6.5V31c0 10.6-5.8 19.1-16 26.4C21.8 50.1 16 41.6 16 31V19.5Z" stroke="currentColor" strokeWidth="1.5" opacity=".58" />
      <path d="m18 22 6.5 2.7m21.5-2.7-6.5 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 25a5 5 0 0 0-3.1 8.9L27.5 42h9l-1.4-8.1A5 5 0 0 0 32 25Z" fill="currentColor" />
    </svg>
  );
}

export default function Login({ onLoginSuccess, notice }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });
      onLoginSuccess(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Sign-in failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout" aria-labelledby="sign-in-title">
      <div className="auth-intro">
        <a className="brand-lockup" href="#sign-in-title" aria-label="Bastion home">
          <span className="brand-mark"><BastionMark /></span>
          <span className="brand-name">BASTION<span> / ACCESS</span></span>
        </a>
        <div className="intro-copy">
          <p className="eyebrow">EXPERIMENT 07 <span>—</span> IDENTITY BASTION</p>
          <h1>Access, made<br /><em>deliberate.</em></h1>
          <p className="intro-description">
            A focused workspace for exploring authenticated access and role-based task permissions.
          </p>
        </div>
        <div className="trust-note">
          <span className="trust-mark" aria-hidden="true"><BastionMark /></span>
          <p>Only the permissions provided by the service are shown here. No extra security signals are inferred.</p>
        </div>
        <span className="intro-index" aria-hidden="true">01 — IDENTITY / ACCESS</span>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-heading">
          <p className="eyebrow">PROTECTED ENTRY</p>
          <h2 id="sign-in-title">Sign in to continue</h2>
          <p>Use your account credentials to open the task workspace.</p>
        </div>
        {notice && <p className="session-notice" role="status">{notice}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              className="form-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Your username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit" className="btn-primary sign-in-button" disabled={loading}>
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <span aria-hidden="true">{loading ? '···' : '↗'}</span>
          </button>
          {loading && <p className="form-status" role="status">Verifying credentials with the service…</p>}
        </form>
        <div className="auth-footnote">
          <span className="footnote-line" />
          <p>Your credentials are sent to the authentication service.</p>
        </div>
      </div>
    </section>
  );
}
