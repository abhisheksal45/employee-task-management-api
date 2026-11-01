import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, task, serverErrors }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setErrors({});
  }, [task, isOpen]);

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3 || title.trim().length > 100) {
      newErrors.title = 'Title must be between 3 and 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description can be at most 500 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
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
    <div className="modal-backdrop" id="task-modal-backdrop" onClick={onClose}>
      <div className="modal-content" id="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={20} color="var(--primary-500)" />
            <h2 className="modal-title" id="task-modal-title">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-task-modal-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title-input">
                Task Title *
              </label>
              <input
                type="text"
                id="task-title-input"
                className="form-control"
                placeholder="e.g. Implement user login session"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                maxLength={100}
                required
                autoFocus
              />
              {errors.title && <span className="field-error" id="task-title-error">{errors.title}</span>}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {title.length}/100 chars (min 3)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc-input">
                Description (Optional)
              </label>
              <textarea
                id="task-desc-input"
                className="form-control"
                placeholder="Provide task scope, acceptance criteria, or details..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                }}
                maxLength={500}
              />
              {errors.description && <span className="field-error" id="task-desc-error">{errors.description}</span>}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {description.length}/500 chars
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              id="cancel-task-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-task-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
