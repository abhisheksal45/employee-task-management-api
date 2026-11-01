import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users } from 'lucide-react';

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employee,
  departments,
  serverErrors
}) {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setDepartmentId(employee.departmentId ? String(employee.departmentId) : '');
    } else {
      setName('');
      setDepartmentId(departments.length > 0 ? String(departments[0].id) : '');
    }
    setErrors({});
  }, [employee, departments, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2 || name.trim().length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    if (!departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        departmentId: Number(departmentId)
      });
      onClose();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" id="employee-modal-backdrop" onClick={onClose}>
      <div className="modal-content" id="employee-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--accent-cyan)" />
            <h2 className="modal-title" id="employee-modal-title">
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-employee-modal-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="employee-name-input">
                Employee Full Name *
              </label>
              <input
                type="text"
                id="employee-name-input"
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                maxLength={50}
                required
                autoFocus
              />
              {errors.name && <span className="field-error" id="emp-name-error">{errors.name}</span>}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {name.length}/50 chars (min 2)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="employee-dept-select">
                Assigned Department *
              </label>
              <select
                id="employee-dept-select"
                className="form-control"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: null }));
                }}
                required
              >
                <option value="" disabled>Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <span className="field-error" id="emp-dept-error">{errors.departmentId}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              id="cancel-employee-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-employee-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
