import React, { useState } from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  Plus,
  Menu,
  ChevronDown,
  CheckSquare,
  UserPlus,
  Building,
  Shield,
  User,
  LogOut,
  LogIn,
  Lock,
  ArrowRightLeft
} from 'lucide-react';

export default function Header({
  activeTab,
  theme,
  setTheme,
  isDemoMode,
  backendChecking,
  onCheckBackend,
  onOpenTaskModal,
  onOpenEmployeeModal,
  onOpenDepartmentModal,
  setMobileOpen,
  currentUser,
  isAdmin,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onSwitchDemoRole
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const tabTitles = {
    overview: {
      title: 'Executive Dashboard',
      subtitle: 'Real-time overview of tasks, team workload, and department structure'
    },
    tasks: {
      title: 'Task Management & Kanban',
      subtitle: 'Track sprint tasks, manage assignees, and update workflows'
    },
    employees: {
      title: 'Employee Directory',
      subtitle: 'Manage staff, department allocations, and assigned work'
    },
    departments: {
      title: 'Departments Hub',
      subtitle: 'Organize team structures and monitor employee distribution'
    }
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  const userInitial = currentUser?.username
    ? currentUser.username.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="top-header" id="app-top-header">
      <div className="header-left">
        <button
          className="btn btn-ghost btn-icon"
          id="mobile-menu-toggle-btn"
          style={{ display: 'none' }}
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <div className="header-title-box">
          <h1 id="page-heading-title">{currentTabInfo.title}</h1>
          <p className="header-subtitle" id="page-heading-subtitle">{currentTabInfo.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Connection status pill */}
        <div
          id="backend-status-indicator"
          className={`backend-status-pill ${isDemoMode ? 'offline' : 'online'}`}
          onClick={onCheckBackend}
          title="Click to re-ping Spring Boot backend at http://localhost:8080"
        >
          <span className={`status-dot ${isDemoMode ? 'offline' : 'online'}`} />
          <span style={{ fontSize: '0.78rem' }}>
            {isDemoMode ? 'Offline / Demo' : 'Connected (8080)'}
          </span>
          <RefreshCw
            size={13}
            style={{
              animation: backendChecking ? 'spin 1s linear infinite' : 'none',
              marginLeft: '2px'
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          className="btn btn-secondary btn-icon"
          onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#d97706" /> : <Moon size={17} color="#475569" />}
        </button>

        {/* Quick create action dropdown (Enabled only if user has ADMIN rights) */}
        <div style={{ position: 'relative' }}>
          <button
            id="quick-create-menu-btn"
            className="btn btn-primary"
            onClick={() => setDropdownOpen(prev => !prev)}
            title={isAdmin ? 'Create new task, employee or department' : 'Requires ADMIN role'}
            style={!isAdmin ? { opacity: 0.75 } : {}}
          >
            {isAdmin ? <Plus size={16} /> : <Lock size={14} />}
            <span>Create</span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                id="quick-create-dropdown"
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '210px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {!isAdmin && (
                  <div style={{
                    padding: '8px 10px',
                    fontSize: '0.74rem',
                    color: '#e11d48',
                    background: 'rgba(225, 29, 72, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Lock size={13} />
                    <span>Admin permissions required</span>
                  </div>
                )}

                <button
                  id="dropdown-new-task-btn"
                  className="nav-item"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    opacity: isAdmin ? 1 : 0.6,
                    cursor: isAdmin ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    if (isAdmin) onOpenTaskModal();
                  }}
                >
                  <div className="nav-item-content">
                    <CheckSquare size={16} color="var(--primary-500)" />
                    <span>New Task</span>
                  </div>
                </button>
                <button
                  id="dropdown-new-employee-btn"
                  className="nav-item"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    opacity: isAdmin ? 1 : 0.6,
                    cursor: isAdmin ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    if (isAdmin) onOpenEmployeeModal();
                  }}
                >
                  <div className="nav-item-content">
                    <UserPlus size={16} color="var(--accent-cyan)" />
                    <span>Add Employee</span>
                  </div>
                </button>
                <button
                  id="dropdown-new-dept-btn"
                  className="nav-item"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    opacity: isAdmin ? 1 : 0.6,
                    cursor: isAdmin ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    if (isAdmin) onOpenDepartmentModal();
                  }}
                >
                  <div className="nav-item-content">
                    <Building size={16} color="var(--accent-emerald)" />
                    <span>New Department</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Authentication & Profile Pill */}
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <button
              id="user-profile-menu-btn"
              className="btn btn-secondary"
              style={{
                padding: '4px 10px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-full)'
              }}
              onClick={() => setUserMenuOpen(prev => !prev)}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isAdmin ? 'var(--primary-500)' : '#64748b',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {userInitial}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {currentUser.username}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '1px 6px',
                borderRadius: '4px',
                background: isAdmin ? 'rgba(37, 99, 235, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                color: isAdmin ? 'var(--primary-500)' : 'var(--text-secondary)',
                border: `1px solid ${isAdmin ? 'rgba(37, 99, 235, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
              }}>
                {isAdmin ? 'ADMIN' : 'USER'}
              </span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  id="user-profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '230px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px'
                  }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      @{currentUser.username}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px'
                    }}>
                      {isAdmin ? <Shield size={12} color="var(--primary-500)" /> : <User size={12} />}
                      <span>{isAdmin ? 'Administrator (Full Access)' : 'Viewer (Read-Only)'}</span>
                    </div>
                  </div>

                  {/* Switch Role in Demo Mode */}
                  {isDemoMode && onSwitchDemoRole && (
                    <button
                      id="header-switch-demo-role-btn"
                      className="nav-item"
                      style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSwitchDemoRole(isAdmin ? 'USER' : 'ADMIN');
                      }}
                    >
                      <div className="nav-item-content">
                        <ArrowRightLeft size={14} color="var(--accent-amber)" />
                        <span>Switch to {isAdmin ? 'Viewer (USER)' : 'Admin (ADMIN)'}</span>
                      </div>
                    </button>
                  )}

                  <button
                    id="header-logout-btn"
                    className="nav-item"
                    style={{ padding: '8px 10px', fontSize: '0.78rem', color: '#e11d48' }}
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <div className="nav-item-content">
                      <LogOut size={14} color="#e11d48" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Unauthenticated state actions */
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              id="header-signin-btn"
              className="btn btn-secondary btn-sm"
              onClick={onOpenLogin}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              id="header-register-btn"
              className="btn btn-primary btn-sm"
              onClick={onOpenRegister}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
