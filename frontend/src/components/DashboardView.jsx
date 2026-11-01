import React from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
  PlayCircle,
  Lock
} from 'lucide-react';
import AuthBanner from './AuthBanner';

export default function DashboardView({
  departments,
  employees,
  tasks,
  isDemoMode,
  setActiveTab,
  onOpenTaskModal,
  onUpdateTaskStatus,
  currentUser,
  isAdmin,
  isBackendReachable,
  onOpenLogin,
  onOpenRegister,
  onSwitchToDemo,
  onSwitchDemoRole
}) {
  const totalEmployees = employees?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const totalDepartments = departments?.length ?? 0;

  const todoTasks = tasks?.filter(t => t.status === 'TODO') ?? [];
  const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS') ?? [];
  const doneTasks = tasks?.filter(t => t.status === 'DONE') ?? [];

  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
  const inProgressRate = totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0;
  const todoRate = totalTasks > 0 ? Math.round((todoTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="page-content" id="dashboard-view-container">
      {/* Security & Authentication Banner (Shows login prompt or read-only status) */}
      <AuthBanner
        currentUser={currentUser}
        isAdmin={isAdmin}
        isDemoMode={isDemoMode}
        isBackendReachable={isBackendReachable}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onSwitchToDemo={onSwitchToDemo}
        onSwitchDemoRole={onSwitchDemoRole}
      />

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="notice-banner" id="demo-mode-notice-banner">
          <div className="notice-content">
            <Info size={20} color="#818cf8" />
            <div>
              <strong>Demo & Mock Mode Active</strong> — Running with simulated realistic state.
              To connect to your live Spring Boot backend, launch <code>./mvnw spring-boot:run</code> on port 8080.
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            id="view-api-docs-btn"
            onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}
          >
            Swagger UI
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="stats-grid" id="dashboard-stats-grid">
        <div className="stat-card" id="stat-card-employees">
          <div className="stat-card-header">
            <span className="stat-label">Total Employees</span>
            <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-val-employees">{totalEmployees}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669' }}>
            <TrendingUp size={13} />
            <span>Across {totalDepartments} departments</span>
          </div>
        </div>

        <div className="stat-card" id="stat-card-active-tasks">
          <div className="stat-card-header">
            <span className="stat-label">In-Progress Tasks</span>
            <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-val-in-progress">{inProgressTasks.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>{todoTasks.length} in backlog</span>
          </div>
        </div>

        <div className="stat-card" id="stat-card-completed-tasks">
          <div className="stat-card-header">
            <span className="stat-label">Completed Tasks</span>
            <div className="stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-val-completed">{doneTasks.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669' }}>
            <span>{completionRate}% completed</span>
          </div>
        </div>

        <div className="stat-card" id="stat-card-departments">
          <div className="stat-card-header">
            <span className="stat-label">Departments</span>
            <div className="stat-icon-box" style={{ background: '#f1f5f9', color: '#475569' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div className="stat-value" id="stat-val-departments">{totalDepartments}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>Company divisions</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Task Breakdown & Department Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Task Velocity & Distribution */}
        <div className="stat-card" style={{ padding: '20px' }} id="task-distribution-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', marginBottom: '2px' }}>Sprint Progress</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Task distribution by workflow stage</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              id="view-all-tasks-link-btn"
              onClick={() => setActiveTab('tasks')}
            >
              <span>Kanban</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Progress Multi-Bar */}
          <div style={{
            height: '8px',
            width: '100%',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '16px'
          }}>
            <div style={{ width: `${doneTasks.length / (totalTasks || 1) * 100}%`, background: '#059669' }} title={`Done: ${doneTasks.length}`} />
            <div style={{ width: `${inProgressTasks.length / (totalTasks || 1) * 100}%`, background: '#2563eb' }} title={`In Progress: ${inProgressTasks.length}`} />
            <div style={{ width: `${todoTasks.length / (totalTasks || 1) * 100}%`, background: '#94a3b8' }} title={`To Do: ${todoTasks.length}`} />
          </div>

          {/* Status Breakdown Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#475569', marginBottom: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                <span>TO DO</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{todoTasks.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{todoRate}% of total</div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#1d4ed8', marginBottom: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
                <span>IN PROGRESS</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{inProgressTasks.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inProgressRate}% of total</div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#047857', marginBottom: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                <span>DONE</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{doneTasks.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completionRate}% of total</div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="stat-card" style={{ padding: '20px' }} id="dept-distribution-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', marginBottom: '2px' }}>Staff by Department</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Employee distribution across units</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              id="view-all-depts-link-btn"
              onClick={() => setActiveTab('departments')}
            >
              <span>Manage</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {departments?.slice(0, 5).map(dept => {
              const count = dept.employeeCount ?? employees.filter(e => e.departmentId === dept.id).length;
              const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
              return (
                <div key={dept.id} id={`dept-row-${dept.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{dept.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Active Sprints & Key Tasks</h2>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            Quick status progression & employee assignments
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          id="dashboard-new-task-btn"
          onClick={() => {
            if (isAdmin) onOpenTaskModal();
          }}
          title={isAdmin ? 'Create Task' : 'Admin role required'}
          style={!isAdmin ? { opacity: 0.65 } : {}}
        >
          {isAdmin ? <span>+ Create Task</span> : <span><Lock size={12} style={{ marginRight: '4px' }} /> Create Task (Admin)</span>}
        </button>
      </div>

      <div className="table-container" id="dashboard-tasks-table">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Task Title</th>
              <th>Status</th>
              <th>Assignees</th>
              <th style={{ textAlign: 'right' }}>Quick Advance</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.slice(0, 6).map(task => (
              <tr key={task.id} id={`task-row-${task.id}`}>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.id}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.description}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`status-pill ${task.status}`}>{task.status.replace('_', ' ')}</span>
                </td>
                <td>
                  <div className="assignees-stack">
                    {task.assignees?.length > 0 ? (
                      task.assignees.map(a => (
                        <div key={a.id} className="avatar-chip" title={a.name}>
                          {a.name.charAt(0)}
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {task.status === 'TODO' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      id={`start-task-btn-${task.id}`}
                      onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                      title={isAdmin ? 'Advance status' : 'Admin role required'}
                      style={!isAdmin ? { opacity: 0.65 } : {}}
                    >
                      {isAdmin ? <PlayCircle size={14} color="#818cf8" /> : <Lock size={12} />}
                      <span>Start</span>
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      id={`complete-task-btn-${task.id}`}
                      onClick={() => onUpdateTaskStatus(task.id, 'DONE')}
                      title={isAdmin ? 'Complete task' : 'Admin role required'}
                      style={!isAdmin ? { opacity: 0.65 } : {}}
                    >
                      {isAdmin ? <CheckCircle2 size={14} color="#10b981" /> : <Lock size={12} />}
                      <span>Complete</span>
                    </button>
                  )}
                  {task.status === 'DONE' && (
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ Finished
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
