import React, { useState } from 'react';
import {
  Search,
  Users,
  UserPlus,
  Building,
  CheckSquare,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Lock
} from 'lucide-react';

export default function EmployeesView({
  employees,
  departments,
  filters,
  setFilters,
  pagination,
  onPageChange,
  onOpenCreateEmployee,
  onOpenEditEmployee,
  onDeleteEmployee,
  onViewEmployeeTasks,
  isAdmin
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const avatarColors = [
    { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' },
    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }
  ];

  return (
    <div className="page-content" id="employees-view-container">
      {/* Filter and Action Bar */}
      <div className="filter-bar" id="employees-filter-bar">
        <div className="filter-group">
          {/* Search by name */}
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              id="employee-search-input"
              className="form-input"
              placeholder="Search employee by name..."
              value={filters.name || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value, page: 0 }))}
            />
          </div>

          {/* Filter by department */}
          <select
            id="employee-dept-filter"
            className="form-select"
            value={filters.department || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined, page: 0 }))}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>

          {/* Filter by task status */}
          <select
            id="employee-task-status-filter"
            className="form-select"
            value={filters.taskStatus || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, taskStatus: e.target.value || undefined, page: 0 }))}
          >
            <option value="">All Task States</option>
            <option value="TODO">Has 'To Do' Tasks</option>
            <option value="IN_PROGRESS">Has 'In Progress' Tasks</option>
            <option value="DONE">Has 'Done' Tasks</option>
          </select>

          {/* Sort By */}
          <select
            id="employee-sort-by-select"
            className="form-select"
            value={`${filters.sortBy || 'id'}-${filters.direction || 'asc'}`}
            onChange={(e) => {
              const [sb, dir] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy: sb, direction: dir }));
            }}
          >
            <option value="id-asc">Sort: ID (Ascending)</option>
            <option value="id-desc">Sort: ID (Descending)</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
          </select>
        </div>

        {/* View Toggle & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}>
            <button
              id="employee-view-grid-btn"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grid')}
              title="Cards Grid"
              style={{ padding: '6px 12px' }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              id="employee-view-table-btn"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{ padding: '6px 12px' }}
            >
              <List size={15} />
            </button>
          </div>

          <button
            id="add-employee-btn"
            className="btn btn-primary"
            onClick={() => {
              if (isAdmin) onOpenCreateEmployee();
            }}
            title={isAdmin ? 'Add Employee' : 'Admin role required'}
            style={!isAdmin ? { opacity: 0.7 } : {}}
          >
            {isAdmin ? <UserPlus size={16} /> : <Lock size={14} />}
            <span>{isAdmin ? 'Add Employee' : 'Add Employee (Admin)'}</span>
          </button>
        </div>
      </div>

      {/* Grid or Table content */}
      {viewMode === 'grid' ? (
        <div className="employee-grid" id="employees-grid-list">
          {employees.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)'
            }}>
              <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div>No employees found matching filter criteria.</div>
            </div>
          ) : (
            employees.map((emp, index) => {
              const palette = avatarColors[index % avatarColors.length];
              return (
                <div key={emp.id} className="employee-card" id={`emp-card-${emp.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div
                      className="employee-avatar-large"
                      style={{
                        background: palette.bg,
                        color: palette.color,
                        border: `1px solid ${palette.border}`
                      }}
                    >
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        id={`edit-emp-btn-${emp.id}`}
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => {
                          if (isAdmin) onOpenEditEmployee(emp);
                        }}
                        title={isAdmin ? 'Edit employee' : 'Admin role required'}
                        style={!isAdmin ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        id={`delete-emp-btn-${emp.id}`}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: '#fb7185', opacity: isAdmin ? 1 : 0.4, cursor: isAdmin ? 'pointer' : 'not-allowed' }}
                        onClick={() => {
                          if (isAdmin) onDeleteEmployee(emp);
                        }}
                        title={isAdmin ? 'Delete employee' : 'Admin role required'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="employee-name">{emp.name}</div>
                  <div className="dept-tag">
                    <Building size={12} />
                    <span>{emp.departmentName || 'No Department'}</span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      id={`view-tasks-emp-btn-${emp.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => onViewEmployeeTasks(emp)}
                    >
                      <CheckSquare size={14} color="#818cf8" />
                      <span>Assigned Tasks</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="table-container" id="employees-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Workload</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No employees found matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} id={`emp-table-row-${emp.id}`}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{emp.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-chip" style={{ width: '32px', height: '32px', fontSize: '0.82rem' }}>
                          {emp.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag" style={{ margin: 0 }}>
                        <Building size={12} />
                        <span>{emp.departmentName || 'None'}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        id={`table-view-tasks-${emp.id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewEmployeeTasks(emp)}
                      >
                        <CheckSquare size={13} />
                        <span>View Tasks</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          id={`table-edit-emp-${emp.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (isAdmin) onOpenEditEmployee(emp);
                          }}
                          title={isAdmin ? 'Edit employee' : 'Admin role required'}
                          style={!isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          id={`table-delete-emp-${emp.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (isAdmin) onDeleteEmployee(emp);
                          }}
                          title={isAdmin ? 'Delete employee' : 'Admin role required'}
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
        </div>
      )}

      {/* Pagination Bar */}
      {pagination && (
        <div className="pagination-bar" id="employees-pagination-bar">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing page {pagination.page + 1} of {pagination.totalPages || 1} ({pagination.totalElements} total employees)
          </span>

          <div className="page-controls">
            <button
              id="emp-prev-page-btn"
              className="btn btn-secondary btn-sm"
              disabled={pagination.first}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.8rem', padding: '0 8px', fontWeight: 600 }}>
              {pagination.page + 1}
            </span>
            <button
              id="emp-next-page-btn"
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
  );
}
