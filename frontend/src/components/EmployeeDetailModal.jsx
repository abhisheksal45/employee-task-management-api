import React, { useState, useEffect } from 'react';
import { X, Users, Building, CheckSquare, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { EmployeeAPI } from '../services/api';

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onUpdateTaskStatus
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && employee?.id) {
      loadEmployeeTasks(employee.id);
    } else {
      setTasks([]);
    }
  }, [isOpen, employee]);

  const loadEmployeeTasks = async (empId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmployeeAPI.getTasks(empId);
      setTasks(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (onUpdateTaskStatus) {
      await onUpdateTaskStatus(taskId, newStatus);
      // reload
      loadEmployeeTasks(employee.id);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-backdrop" id="employee-detail-modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} id="emp-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary-500)" />
            <h2 className="modal-title">Employee Profile & Assigned Tasks</h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-emp-detail-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Employee Header Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div className="employee-avatar-large" style={{ margin: 0, width: '48px', height: '48px', fontSize: '1.1rem' }}>
              {employee.name?.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{employee.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span className="dept-tag" style={{ margin: 0 }}>
                  <Building size={12} />
                  <span>{employee.departmentName || 'No Department'}</span>
                </span>
                <span>• Employee ID #{employee.id}</span>
              </div>
            </div>
          </div>

          {/* Assigned Tasks Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Assigned Tasks ({tasks.length})</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>via GET /api/employees/{employee.id}/tasks</span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading assigned tasks...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          ) : tasks.length === 0 ? (
            <div style={{
              padding: '36px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckSquare size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <div>No tasks currently assigned to {employee.name}.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {tasks.map(task => (
                <div
                  key={task.id}
                  id={`emp-task-item-${task.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {task.description}
                        </div>
                      )}
                    </div>
                    <span className={`status-pill ${task.status}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Task #{task.id}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {task.status === 'TODO' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        >
                          Start Task
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleStatusChange(task.id, 'DONE')}
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="close-emp-detail-footer-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
