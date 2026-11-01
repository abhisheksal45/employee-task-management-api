import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  Layers,
  RotateCcw,
  Zap,
  Shield,
  User,
  LogOut,
  LogIn,
  ArrowRightLeft
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  stats,
  isDemoMode,
  isForceDemo,
  onToggleDemoMode,
  onResetDemoData,
  mobileOpen,
  setMobileOpen,
  currentUser,
  isAdmin,
  onOpenLogin,
  onLogout,
  onSwitchDemoRole
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tasks',
      label: 'Tasks & Kanban',
      icon: CheckSquare,
      badge: stats?.tasksCount ?? 0
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      badge: stats?.employeesCount ?? 0
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      badge: stats?.departmentsCount ?? 0
    }
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} id="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-icon-wrapper">
            <Layers size={22} />
          </div>
          <div className="brand-text">
            <h2>TaskSphere</h2>
            <span className="brand-tag">Spring Boot Sec</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
            >
              <div className="nav-item-content">
                <Icon size={19} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="nav-badge" id={`nav-badge-${item.id}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* User Identity Card */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '10px'
        }}>
          {currentUser ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isAdmin ? 'var(--primary-500)' : '#64748b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      @{currentUser.username}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={13} color="#e11d48" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isAdmin ? 'rgba(37, 99, 235, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                  color: isAdmin ? 'var(--primary-500)' : 'var(--text-secondary)',
                  border: `1px solid ${isAdmin ? 'rgba(37, 99, 235, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isAdmin ? <Shield size={10} /> : <User size={10} />}
                  <span>{isAdmin ? 'ADMIN' : 'USER'}</span>
                </span>

                {isDemoMode && onSwitchDemoRole && (
                  <button
                    onClick={() => onSwitchDemoRole(isAdmin ? 'USER' : 'ADMIN')}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', padding: '2px 6px', height: 'auto' }}
                    title={`Switch role to ${isAdmin ? 'USER' : 'ADMIN'}`}
                  >
                    <ArrowRightLeft size={11} />
                    <span>Set {isAdmin ? 'USER' : 'ADMIN'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Not signed in</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenLogin}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                <LogIn size={12} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* Environment Box */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Environment
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '4px',
              background: isDemoMode ? '#fef3c7' : '#ecfdf5',
              color: isDemoMode ? '#92400e' : '#047857',
              border: `1px solid ${isDemoMode ? '#fde68a' : '#a7f3d0'}`
            }}>
              {isDemoMode ? 'Demo Mode' : 'Live Connected'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              id="toggle-demo-mode-btn"
              onClick={onToggleDemoMode}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 8px' }}
              title="Force switch between Demo and Spring Boot Live API"
            >
              <Zap size={14} color={isForceDemo ? '#fbbf24' : 'currentColor'} />
              <span>{isForceDemo ? 'Unforce Demo Mode' : 'Simulate Demo Mode'}</span>
            </button>

            {isDemoMode && (
              <button
                id="reset-demo-data-btn"
                onClick={onResetDemoData}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.75rem', padding: '6px 8px' }}
                title="Reset mock items to default"
              >
                <RotateCcw size={14} />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
          Spring Boot REST API v4.0.0
        </div>
      </div>
    </aside>
  );
}
