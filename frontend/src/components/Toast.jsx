import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`} id={`toast-${toast.id}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
          {toast.type === 'error' && <AlertCircle size={18} color="var(--accent-rose)" />}
          {toast.type === 'info' && <Info size={18} color="var(--primary-500)" />}

          <div style={{ flex: 1 }}>
            {toast.title && <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{toast.title}</div>}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{toast.message}</div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="btn-ghost"
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            id={`dismiss-toast-${toast.id}`}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
