import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AuthAPI } from '../services/api';

export default function AuthModal({
  isOpen,
  initialMode = 'login', // 'login' | 'register'
  onClose,
  onSuccess,
  isDemoMode,
  onSwitchToDemo
}) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setFieldErrors({});
      setRegisterSuccess(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Real-time client validation checks for registration
  const usernameValidChars = /^[A-Za-z0-9_]+$/.test(username);
  const usernameValidLength = username.length >= 3 && username.length <= 30;
  const usernameIsValid = usernameValidChars && usernameValidLength;

  const passwordValidLength = password.length >= 8 && password.length <= 64;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Quick fill helper
  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setConfirmPassword(p);
    setErrorMessage('');
    setFieldErrors({});
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!username.trim()) {
      setFieldErrors(prev => ({ ...prev, username: 'Username is required' }));
      return;
    }
    if (!password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      const result = await AuthAPI.login({ username, password });
      setLoading(false);
      if (onSuccess) onSuccess(result.user, 'Logged in successfully!');
      onClose();
    } catch (err) {
      setLoading(false);
      console.error('Login error', err);
      if (err.status === 401) {
        setErrorMessage('Invalid username or password. Please check your credentials.');
      } else {
        setErrorMessage(err.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (!usernameIsValid) {
      errors.username = 'Username must be 3-30 characters (letters, numbers, underscore only)';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!passwordValidLength) {
      errors.password = 'Password must be between 8 and 64 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const registered = await AuthAPI.register({ username, password });
      setLoading(false);
      setRegisterSuccess(true);

      // Attempt auto-login with newly registered user
      try {
        const loginResult = await AuthAPI.login({ username, password });
        if (onSuccess) {
          onSuccess(loginResult.user, `Welcome @${registered.username}! Account created and signed in.`);
        }
        onClose();
      } catch (_autoLoginErr) {
        // If auto-login fails, simply show success and transition to login tab
        setMode('login');
        setErrorMessage('');
      }
    } catch (err) {
      setLoading(false);
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="modal-backdrop" id="auth-modal-backdrop" onClick={onClose}>
      <div
        className="modal-content auth-modal-card"
        id="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
      >
        {/* Modal Top Header with Tabs */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '20px 24px 0 24px',
          position: 'relative'
        }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Shield size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                TaskSphere Security
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Spring Boot JWT Authentication
              </span>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: 'none'
          }}>
            <button
              id="auth-tab-login"
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setFieldErrors({});
              }}
            >
              Sign In
            </button>
            <button
              id="auth-tab-register"
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setFieldErrors({});
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Feedback error alert */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              style={{
                background: 'rgba(225, 29, 72, 0.08)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#e11d48'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Success banner */}
          {registerSuccess && mode === 'login' && (
            <div
              style={{
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#059669'
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <div>Account created! Please sign in with your credentials.</div>
            </div>
          )}

          {/* ==================== SIGN IN FORM ==================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} id="auth-login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-username-input">
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    id="login-username-input"
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    style={{ paddingLeft: '36px' }}
                    autoComplete="username"
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                {fieldErrors.username && (
                  <span className="field-error">{fieldErrors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password-input">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter password"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="field-error">{fieldErrors.password}</span>
                )}
              </div>

              {/* Quick credentials testing pill */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '18px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}>
                  <Sparkles size={13} color="var(--primary-500)" />
                  <span>Quick Test Accounts</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    onClick={() => handleQuickFill('admin', 'admin123')}
                  >
                    Admin: <code>admin</code>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    onClick={() => handleQuickFill('rahul', 'secret123')}
                  >
                    User: <code>rahul</code>
                  </button>
                </div>
              </div>

              <button
                id="auth-login-submit-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                disabled={loading}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    setFieldErrors({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-500)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* ==================== REGISTER FORM ==================== */
            <form onSubmit={handleRegisterSubmit} id="auth-register-form">
              <div className="form-group">
                <label className="form-label" htmlFor="register-username-input">
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    id="register-username-input"
                    type="text"
                    className="form-control"
                    placeholder="3-30 letters, numbers, or _"
                    style={{ paddingLeft: '36px' }}
                    autoComplete="username"
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                {fieldErrors.username && (
                  <span className="field-error">{fieldErrors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-password-input">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="field-error">{fieldErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-confirm-password-input">
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    id="register-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-enter password"
                    style={{ paddingLeft: '36px' }}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="field-error">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              {/* Requirement Checklist */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '18px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.74rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Validation Requirements:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: usernameIsValid ? '#059669' : 'var(--text-muted)'
                  }}>
                    <CheckCircle size={13} color={usernameIsValid ? '#059669' : '#94a3b8'} />
                    <span>Username: 3-30 characters (letters, numbers, underscore)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: passwordValidLength ? '#059669' : 'var(--text-muted)'
                  }}>
                    <CheckCircle size={13} color={passwordValidLength ? '#059669' : '#94a3b8'} />
                    <span>Password: 8 to 64 characters</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: passwordsMatch ? '#059669' : 'var(--text-muted)'
                  }}>
                    <CheckCircle size={13} color={passwordsMatch ? '#059669' : '#94a3b8'} />
                    <span>Passwords match</span>
                  </div>
                </div>

                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem'
                }}>
                  * Note: New registrations receive <strong>USER</strong> role (Read-Only access).
                  Administrative actions (create, edit, delete) require <strong>ADMIN</strong> role.
                </div>
              </div>

              <button
                id="auth-register-submit-btn"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                disabled={loading}
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setFieldErrors({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-500)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Fallback to Demo Mode option */}
          {!isDemoMode && onSwitchToDemo && (
            <div style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  onSwitchToDemo();
                  onClose();
                }}
                style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}
              >
                <Zap size={13} color="#d97706" />
                <span>Or explore application in Offline Demo Mode</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
