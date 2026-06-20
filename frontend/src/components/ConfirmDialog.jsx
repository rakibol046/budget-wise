const ConfirmDialog = ({ message, subMessage, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
    onClick={onCancel}
  >
    <div
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px 32px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f8717120', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <svg width="22" height="22" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </div>

      <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: 'var(--color-text)' }}>
        {message}
      </h3>
      {subMessage && (
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {subMessage}
        </p>
      )}
      {!subMessage && <div style={{ marginBottom: '24px' }} />}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, padding: '11px', background: '#f87171', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
