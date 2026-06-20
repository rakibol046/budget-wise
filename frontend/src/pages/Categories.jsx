import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCategoryStore from '../store/categoryStore.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const EMOJI_PRESETS = ['🛒','⚡','☕','🚌','📦','🍔','🎮','🏥','✈️','🏠','💡','👗','📚','💪','🎵','🐾','🎁','💼','🌿','🔧','🍕','🎬','🐶','🚀','🎓'];
const COLOR_PRESETS = ['#4fd1c5','#f59e0b','#818cf8','#34d399','#f87171','#60a5fa','#e879f9','#fb923c','#a3e635','#38bdf8','#f472b6','#c084fc'];

const inputStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
};

const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:  category?.name  || '',
    icon:  category?.icon  || '📦',
    color: category?.color || '#4fd1c5',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const ok = await onSave(form);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
          {category ? 'Edit Category' : 'New Category'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Dining Out" required maxLength={40}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>

          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_PRESETS.map((emoji) => (
                <button key={emoji} type="button" onClick={() => setForm((p) => ({ ...p, icon: emoji }))}
                  style={{ width: '38px', height: '38px', borderRadius: '8px', border: `2px solid ${form.icon === emoji ? 'var(--color-accent)' : 'var(--color-border)'}`, background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '18px' }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLOR_PRESETS.map((color) => (
                <button key={color} type="button" onClick={() => setForm((p) => ({ ...p, color }))}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', border: `3px solid ${form.color === color ? 'var(--color-text)' : 'transparent'}`, background: color, cursor: 'pointer', outline: 'none' }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${form.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {form.icon}
            </div>
            <span style={{ fontWeight: 600, color: form.color }}>{form.name || 'Preview'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Save Category'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '11px 18px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories = () => {
  const { categories, loading, addCategory, editCategory, removeCategory } = useCategoryStore();
  const [modal, setModal] = useState(null); // null | 'add' | {category}
  const [confirmCat, setConfirmCat] = useState(null);

  const handleDelete = (cat) => setConfirmCat(cat);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Categories</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Manage your spending categories.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/budget" style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Budget
          </Link>
          <button onClick={() => setModal('add')} style={{ padding: '10px 20px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            + Add Category
          </button>
        </div>
      </div>

      {loading && !categories.length ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map((cat) => (
            <CategoryRow key={cat._id} cat={cat} onEdit={() => setModal(cat)} onDelete={() => handleDelete(cat)} />
          ))}
          {categories.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '10px', fontSize: '14px' }}>
              No categories yet. Add one above.
            </div>
          )}
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={modal === 'add' ? addCategory : (data) => editCategory(modal._id, data)}
        />
      )}

      {confirmCat && (
        <ConfirmDialog
          message={`Delete "${confirmCat.name}"?`}
          subMessage="This will fail if any expenses use this category."
          confirmLabel="Delete"
          onConfirm={() => { removeCategory(confirmCat._id); setConfirmCat(null); }}
          onCancel={() => setConfirmCat(null)}
        />
      )}
    </div>
  );
};

const CategoryRow = ({ cat, onEdit, onDelete }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${cat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
      {cat.icon}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{cat.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
        {cat.slug}{cat.isDefault ? ' · default' : ''}
      </div>
    </div>

    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
      <button onClick={onEdit} title="Edit" style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '12px' }}>
        Edit
      </button>
      <button onClick={onDelete} title="Delete" style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>
        Delete
      </button>
    </div>
  </div>
);

export default Categories;
