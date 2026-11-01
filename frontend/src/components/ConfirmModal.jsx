import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" id="confirm-modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} id="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="var(--accent-rose)" />
            <h2 className="modal-title" style={{ fontSize: '1.1rem' }}>{title}</h2>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            id="close-confirm-modal-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {message}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="cancel-confirm-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            id="accept-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
