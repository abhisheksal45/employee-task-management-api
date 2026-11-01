import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  department,
  serverErrors
}) {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.name || '');
    } else {
      setName('');
    }
    setErrors({});
  }, [department, isOpen]);

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
      newErrors.name = 'Department name is required';
    } else if (name.trim().length < 2 || name.trim().length > 50) {
      newErrors.name = 'Department name must be between 2 and 50 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim() });
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
    <div className="modal-backdrop" id="department-modal-backdrop" onClick={onClose}>
      <div className="modal-content" id="department-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--accent-emerald)" />
            <h2 className="modal-title" id="department-modal-title">
              {department ? 'Edit Department' : 'Create New Department'}
            </h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-dept-modal-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="dept-name-input">
                Department Name *
              </label>
              <input
                type="text"
                id="dept-name-input"
                className="form-control"
                placeholder="e.g. Infrastructure Engineering"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                maxLength={50}
                required
                autoFocus
              />
              {errors.name && <span className="field-error" id="dept-name-error">{errors.name}</span>}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {name.length}/50 chars (min 2)
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              id="cancel-dept-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-dept-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
