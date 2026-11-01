import React from 'react';
import { Shield, ShieldAlert, LogIn, UserCheck, ArrowRight, Zap, Lock } from 'lucide-react';

export default function AuthBanner({
  currentUser,
  isAdmin,
  isDemoMode,
  isBackendReachable,
  onOpenLogin,
  onOpenRegister,
  onSwitchToDemo,
  onSwitchDemoRole
}) {
  // Scenario 1: Live backend is reachable, but user is NOT logged in
  if (!isDemoMode && isBackendReachable && !currentUser) {
    return (
      <div
        id="auth-gateway-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.08))',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <Lock size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Spring Boot Security Active — Authentication Required
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Sign in with your account to access enterprise data, or test freely in Demo Mode.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="banner-signin-btn"
            className="btn btn-primary btn-sm"
            onClick={onOpenLogin}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            id="banner-register-btn"
            className="btn btn-secondary btn-sm"
            onClick={onOpenRegister}
          >
            <span>Create Account</span>
          </button>
          <button
            id="banner-demo-btn"
            className="btn btn-ghost btn-sm"
            onClick={onSwitchToDemo}
            title="Explore without logging in"
          >
            <Zap size={14} color="#d97706" />
            <span>Demo Mode</span>
          </button>
        </div>
      </div>
    );
  }

  // Scenario 2: User is logged in as USER (Viewer - Read Only)
  if (currentUser && !isAdmin) {
    return (
      <div
        id="user-role-notice-banner"
        style={{
          background: 'rgba(71, 85, 105, 0.06)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <UserCheck size={16} color="var(--primary-500)" />
          <span>
            Signed in as <strong>@{currentUser.username}</strong> with <strong>Viewer (USER)</strong> role.
            You have full browsing & search access. Creating or modifying tasks requires <strong>ADMIN</strong> permissions.
          </span>
        </div>

        {isDemoMode && onSwitchDemoRole && (
          <button
            id="demo-elevate-admin-btn"
            className="btn btn-secondary btn-sm"
            onClick={() => onSwitchDemoRole('ADMIN')}
            style={{ fontSize: '0.74rem', padding: '4px 8px' }}
            title="Elevate current demo session to Admin"
          >
            <Shield size={13} color="var(--primary-500)" />
            <span>Switch to Demo Admin</span>
          </button>
        )}
      </div>
    );
  }

  return null;
}
