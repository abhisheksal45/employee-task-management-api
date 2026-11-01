import React, { useState, useEffect } from 'react';
import { X, Building2, Users, Briefcase } from 'lucide-react';
import { DepartmentAPI } from '../services/api';

export default function DepartmentDetailModal({
  isOpen,
  onClose,
  department,
  onViewEmployeeTasks
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && department?.id) {
      loadDepartmentEmployees(department.id);
    } else {
      setEmployees([]);
    }
  }, [isOpen, department]);

  const loadDepartmentEmployees = async (deptId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepartmentAPI.getEmployees(deptId);
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load department employees');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !department) return null;

  return (
    <div className="modal-backdrop" id="department-detail-modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} id="dept-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--accent-emerald)" />
            <h2 className="modal-title">Department Personnel Roster</h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-dept-detail-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Dept Header */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{department.name}</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Division ID #{department.id} • {employees.length} assigned member{employees.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Team Members</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              via GET /api/departments/{department.id}/employees
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading members...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          ) : employees.length === 0 ? (
            <div style={{
              padding: '36px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Users size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <div>No employees currently assigned to this department.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {employees.map(emp => (
                <div
                  key={emp.id}
                  id={`dept-emp-item-${emp.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar-chip" style={{ width: '32px', height: '32px' }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID #{emp.id}</div>
                    </div>
                  </div>

                  {onViewEmployeeTasks && (
                    <button
                      id={`dept-view-emp-tasks-${emp.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => {
                        onClose();
                        onViewEmployeeTasks(emp);
                      }}
                    >
                      View Tasks
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="close-dept-detail-footer-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
