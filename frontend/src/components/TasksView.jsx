import React, { useState } from 'react';
import {
  Search,
  Kanban,
  List,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  UserPlus,
  Lock
} from 'lucide-react';

export default function TasksView({
  tasks,
  employees,
  filters,
  setFilters,
  pagination,
  onPageChange,
  onOpenCreateTask,
  onOpenEditTask,
  onDeleteTask,
  onUpdateStatus,
  onOpenAssigneeModal,
  isAdmin
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      color: '#64748b',
      icon: Circle,
      tasks: tasks.filter(t => t.status === 'TODO')
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      color: '#2563eb',
      icon: Clock,
      tasks: tasks.filter(t => t.status === 'IN_PROGRESS')
    },
    {
      id: 'DONE',
      title: 'Done',
      color: '#059669',
      icon: CheckCircle2,
      tasks: tasks.filter(t => t.status === 'DONE')
    }
  ];

  return (
    <div className="page-content" id="tasks-view-container">
      {/* Controls & Filter Bar */}
      <div className="filter-bar" id="tasks-filter-bar">
        <div className="filter-group">
          {/* Search by title */}
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              id="task-search-input"
              className="form-input"
              placeholder="Search tasks by title..."
              value={filters.title || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value, page: 0 }))}
            />
          </div>

          {/* Filter by status */}
          <select
            id="task-status-filter"
            className="form-select"
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined, page: 0 }))}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Filter by assignee */}
          <select
            id="task-assignee-filter"
            className="form-select"
            value={filters.assigneeId || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value || undefined, page: 0 }))}
          >
            <option value="">All Assignees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.departmentName || 'Dept'})
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            id="task-sort-by-select"
            className="form-select"
            value={`${filters.sortBy || 'id'}-${filters.direction || 'asc'}`}
            onChange={(e) => {
              const [sb, dir] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy: sb, direction: dir }));
            }}
          >
            <option value="id-asc">Sort: ID (Oldest First)</option>
            <option value="id-desc">Sort: ID (Newest First)</option>
            <option value="title-asc">Sort: Title (A-Z)</option>
            <option value="title-desc">Sort: Title (Z-A)</option>
            <option value="status-asc">Sort: Status</option>
          </select>
        </div>

        {/* View mode toggle & Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}>
            <button
              id="view-kanban-toggle-btn"
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
              style={{ padding: '6px 12px' }}
            >
              <Kanban size={15} />
              <span>Kanban</span>
            </button>
            <button
              id="view-list-toggle-btn"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
              title="Table List View"
              style={{ padding: '6px 12px' }}
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          <button
            id="add-new-task-btn"
            className="btn btn-primary"
            onClick={() => {
              if (isAdmin) onOpenCreateTask();
            }}
            title={isAdmin ? 'Create New Task' : 'Admin role required'}
            style={!isAdmin ? { opacity: 0.7 } : {}}
          >
            {isAdmin ? <Plus size={16} /> : <Lock size={14} />}
            <span>{isAdmin ? 'New Task' : 'New Task (Admin)'}</span>
          </button>
        </div>
      </div>

      {/* Main Kanban or Table Content */}
      {viewMode === 'kanban' ? (
        <div className="kanban-grid" id="kanban-board-container">
          {columns.map(col => {
            const Icon = col.icon;
            return (
              <div key={col.id} className="kanban-col" id={`kanban-col-${col.id.toLowerCase()}`}>
                <div className="kanban-col-header">
                  <div className="col-title-box">
                    <Icon size={18} color={col.color} />
                    <h3 style={{ fontSize: '0.98rem' }}>{col.title}</h3>
                  </div>
                  <span
                    className="col-badge"
                    style={{ background: 'var(--bg-tertiary)', color: col.color }}
                  >
                    {col.tasks.length}
                  </span>
                </div>

                <div className="kanban-cards-list">
                  {col.tasks.length === 0 ? (
                    <div style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.82rem',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      No tasks in {col.title}
                    </div>
                  ) : (
                    col.tasks.map(task => (
                      <div key={task.id} className="task-card" id={`kanban-card-${task.id}`}>
                        <div className="task-card-header">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            #{task.id}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              id={`edit-task-btn-${task.id}`}
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => {
                                if (isAdmin) onOpenEditTask(task);
                              }}
                              title={isAdmin ? 'Edit task' : 'Admin role required'}
                              style={!isAdmin ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              id={`delete-task-btn-${task.id}`}
                              className="btn btn-ghost btn-icon btn-sm"
                              style={{ color: '#fb7185', opacity: isAdmin ? 1 : 0.4, cursor: isAdmin ? 'pointer' : 'not-allowed' }}
                              onClick={() => {
                                if (isAdmin) onDeleteTask(task);
                              }}
                              title={isAdmin ? 'Delete task' : 'Admin role required'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="task-title">{task.title}</div>
                        {task.description && (
                          <div className="task-description">{task.description}</div>
                        )}

                        {/* Assignees stack */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="assignees-stack">
                              {task.assignees?.map(a => (
                                <div key={a.id} className="avatar-chip" title={a.name}>
                                  {a.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              {task.assignees?.length > 0
                                ? `${task.assignees.length} assigned`
                                : 'No assignee'}
                            </span>
                          </div>

                          <button
                            id={`manage-assignees-btn-${task.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              opacity: isAdmin ? 1 : 0.6,
                              cursor: isAdmin ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => {
                              if (isAdmin) onOpenAssigneeModal(task);
                            }}
                            title={isAdmin ? 'Manage Assignees' : 'Admin role required'}
                          >
                            {isAdmin ? <UserPlus size={12} /> : <Lock size={11} />}
                            <span>Assign</span>
                          </button>
                        </div>

                        {/* Status transition footer */}
                        <div className="task-footer">
                          {col.id === 'TODO' && (
                            <button
                              id={`advance-task-btn-${task.id}`}
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', justifyContent: 'center', opacity: isAdmin ? 1 : 0.65 }}
                              onClick={() => {
                                if (isAdmin) onUpdateStatus(task.id, 'IN_PROGRESS');
                              }}
                              title={isAdmin ? 'Start task' : 'Admin role required'}
                            >
                              <span>Start Task</span>
                              {isAdmin ? <ArrowRight size={13} /> : <Lock size={12} />}
                            </button>
                          )}

                          {col.id === 'IN_PROGRESS' && (
                            <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                              <button
                                id={`regress-task-btn-${task.id}`}
                                className="btn btn-secondary btn-sm"
                                style={{ flex: 1, opacity: isAdmin ? 1 : 0.65 }}
                                onClick={() => {
                                  if (isAdmin) onUpdateStatus(task.id, 'TODO');
                                }}
                                title={isAdmin ? 'Move back to To Do' : 'Admin role required'}
                              >
                                <ArrowLeft size={13} />
                                <span>Back</span>
                              </button>
                              <button
                                id={`complete-task-btn-${task.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1, opacity: isAdmin ? 1 : 0.65 }}
                                onClick={() => {
                                  if (isAdmin) onUpdateStatus(task.id, 'DONE');
                                }}
                                title={isAdmin ? 'Mark Done' : 'Admin role required'}
                              >
                                <span>Done</span>
                                {isAdmin ? <CheckCircle2 size={13} /> : <Lock size={12} />}
                              </button>
                            </div>
                          )}

                          {col.id === 'DONE' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                Completed
                              </span>
                              <button
                                id={`reopen-task-btn-${task.id}`}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '0.72rem', padding: '3px 8px', opacity: isAdmin ? 1 : 0.65 }}
                                onClick={() => {
                                  if (isAdmin) onUpdateStatus(task.id, 'IN_PROGRESS');
                                }}
                                title={isAdmin ? 'Reopen task' : 'Admin role required'}
                              >
                                Reopen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="table-container" id="tasks-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Title & Description</th>
                <th>Status</th>
                <th>Assignees</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No tasks found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id} id={`table-task-row-${task.id}`}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{task.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        id={`status-dropdown-${task.id}`}
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.78rem', opacity: isAdmin ? 1 : 0.65 }}
                        value={task.status}
                        disabled={!isAdmin}
                        onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                        title={isAdmin ? 'Change status' : 'Admin role required'}
                      >
                        <option value="TODO">TO DO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="assignees-stack">
                          {task.assignees?.map(a => (
                            <div key={a.id} className="avatar-chip" title={a.name}>
                              {a.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <button
                          id={`table-assign-btn-${task.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '3px 6px', fontSize: '0.72rem', opacity: isAdmin ? 1 : 0.5 }}
                          onClick={() => {
                            if (isAdmin) onOpenAssigneeModal(task);
                          }}
                          title={isAdmin ? 'Assign employees' : 'Admin role required'}
                        >
                          <UserPlus size={13} />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          id={`table-edit-task-${task.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (isAdmin) onOpenEditTask(task);
                          }}
                          title={isAdmin ? 'Edit task' : 'Admin role required'}
                          style={!isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          id={`table-delete-task-${task.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (isAdmin) onDeleteTask(task);
                          }}
                          title={isAdmin ? 'Delete task' : 'Admin role required'}
                          style={!isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination-bar" id="tasks-pagination-bar">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} tasks)
              </span>

              <div className="page-controls">
                <button
                  id="task-prev-page-btn"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.first}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  id="task-next-page-btn"
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.last}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
