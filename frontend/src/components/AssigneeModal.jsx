import React, { useState } from 'react';
import { X, UserPlus, Trash2, Users, Check } from 'lucide-react';

export default function AssigneeModal({
  isOpen,
  onClose,
  task,
  allEmployees,
  onAssign,
  onUnassign
}) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !task) return null;

  const currentAssigneeIds = new Set(task.assignees?.map(a => a.id) || []);
  const availableEmployees = allEmployees.filter(e => !currentAssigneeIds.has(e.id));

  const handleAssign = async () => {
    if (!selectedEmpId) return;
    setLoadingAction(true);
    try {
      await onAssign(task.id, Number(selectedEmpId));
      setSelectedEmpId('');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnassign = async (empId) => {
    setLoadingAction(true);
    try {
      await onUnassign(task.id, empId);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="modal-backdrop" id="assignee-modal-backdrop" onClick={onClose}>
      <div className="modal-content" id="assignee-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary-500)" />
            <h2 className="modal-title" id="assignee-modal-title">Manage Task Assignees</h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-assignee-modal-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Task Summary Banner */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Task #{task.id}</div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {task.title}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`status-pill ${task.status}`}>{task.status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Add New Assignee Selector */}
          <div style={{ marginBottom: '22px' }}>
            <label className="form-label">Add Team Member to Task</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                id="select-new-assignee"
                className="form-control"
                style={{ flex: 1 }}
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                disabled={loadingAction || availableEmployees.length === 0}
              >
                <option value="">
                  {availableEmployees.length === 0 ? 'All employees are already assigned' : 'Select an employee to assign...'}
                </option>
                {availableEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.departmentName || 'No Dept'}
                  </option>
                ))}
              </select>
              <button
                id="confirm-assign-btn"
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={!selectedEmpId || loadingAction}
              >
                <UserPlus size={16} />
                <span>Assign</span>
              </button>
            </div>
          </div>

          {/* Currently Assigned List */}
          <div>
            <label className="form-label" style={{ marginBottom: '10px' }}>
              Currently Assigned ({task.assignees?.length || 0})
            </label>

            {(!task.assignees || task.assignees.length === 0) ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}>
                No team members assigned yet. Use the dropdown above to assign someone.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.assignees.map(assignee => (
                  <div
                    key={assignee.id}
                    id={`assignee-row-${assignee.id}`}
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
                      <div className="avatar-chip" style={{ width: '30px', height: '30px' }}>
                        {assignee.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{assignee.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID #{assignee.id}</div>
                      </div>
                    </div>

                    <button
                      id={`unassign-btn-${assignee.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#fb7185', padding: '4px 8px' }}
                      onClick={() => handleUnassign(assignee.id)}
                      disabled={loadingAction}
                      title="Unassign employee from task"
                    >
                      <Trash2 size={14} />
                      <span style={{ fontSize: '0.76rem' }}>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="close-assignee-dialog-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
