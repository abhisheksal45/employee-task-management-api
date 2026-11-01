import React from 'react';
import { Building2, Users, Plus, Edit2, Trash2, ArrowRight, Lock } from 'lucide-react';

export default function DepartmentsView({
  departments,
  employees,
  onOpenCreateDepartment,
  onOpenEditDepartment,
  onDeleteDepartment,
  onViewDepartmentEmployees,
  isAdmin
}) {
  return (
    <div className="page-content" id="departments-view-container">
      {/* Header bar */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="section-title">Organizational Divisions</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Manage company departments and view assigned personnel
          </p>
        </div>

        <button
          id="add-dept-btn"
          className="btn btn-primary"
          onClick={() => {
            if (isAdmin) onOpenCreateDepartment();
          }}
          title={isAdmin ? 'Create New Department' : 'Admin role required'}
          style={!isAdmin ? { opacity: 0.7 } : {}}
        >
          {isAdmin ? <Plus size={16} /> : <Lock size={14} />}
          <span>{isAdmin ? 'New Department' : 'New Department (Admin)'}</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="department-grid" id="departments-grid">
        {departments.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <Building2 size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div>No departments created yet. Click &quot;+ New Department&quot; to add one.</div>
          </div>
        ) : (
          departments.map(dept => {
            const count = dept.employeeCount ?? employees.filter(e => e.departmentId === dept.id).length;
            return (
              <div key={dept.id} className="dept-card" id={`dept-card-${dept.id}`}>
                <div className="dept-card-top">
                  <div className="dept-icon-wrapper">
                    <Building2 size={24} />
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      id={`edit-dept-btn-${dept.id}`}
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => {
                        if (isAdmin) onOpenEditDepartment(dept);
                      }}
                      title={isAdmin ? 'Edit department' : 'Admin role required'}
                      style={!isAdmin ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      id={`delete-dept-btn-${dept.id}`}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: '#fb7185', opacity: isAdmin ? 1 : 0.4, cursor: isAdmin ? 'pointer' : 'not-allowed' }}
                      onClick={() => {
                        if (isAdmin) onDeleteDepartment(dept);
                      }}
                      title={isAdmin ? 'Delete department' : 'Admin role required'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{dept.name}</h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  marginBottom: '20px'
                }}>
                  <Users size={16} color="var(--primary-500)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  <span>assigned employee{count !== 1 ? 's' : ''}</span>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    id={`view-roster-dept-btn-${dept.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => onViewDepartmentEmployees(dept)}
                  >
                    <span>View Department Members</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
