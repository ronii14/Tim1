import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/categoryService';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data.data ?? res.data);
    } catch {
      setError('Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCategory(deleteId);
      setDeleteId(null);
      fetchCategories();
    } catch {
      alert('Gagal menghapus kategori.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kategori</h1>
          <p style={styles.subtitle}>{categories.length} kategori terdaftar</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => navigate('/admin/categories/create')}>
          + Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <input
          style={styles.search}
          placeholder="Cari nama kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner} /></div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={styles.center}>
          <p style={{ color: '#94a3b8' }}>Tidak ada kategori ditemukan.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Nama', 'Slug', 'Jumlah Produk', 'Aksi'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    <span style={styles.catName}>{c.name}</span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.slug}>{c.slug || '—'}</code>
                  </td>
                  <td style={styles.td}>
                    {c.products_count !== undefined
                      ? <span style={styles.countBadge}>{c.products_count} produk</span>
                      : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => navigate(`/admin/categories/${c.id}/edit`)}
                      >Edit</button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => setDeleteId(c.id)}
                      >Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 8 }}>Hapus Kategori?</h3>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={styles.btnCancel} onClick={() => setDeleteId(null)}>Batal</button>
              <button style={styles.btnDeleteConfirm} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px 24px', fontFamily: 'sans-serif', color: '#1e293b' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 13, color: '#94a3b8', margin: '4px 0 0' },
  btnPrimary: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
    fontWeight: 600, fontSize: 14,
  },
  searchWrap: { marginBottom: 20 },
  search: {
    width: '100%', maxWidth: 360, padding: '10px 14px',
    border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '12px 16px',
    background: '#f8fafc', color: '#64748b',
    fontWeight: 600, fontSize: 12, textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  catName: { fontWeight: 600 },
  slug: {
    background: '#f1f5f9', color: '#64748b',
    borderRadius: 4, padding: '2px 8px', fontSize: 12,
  },
  countBadge: {
    background: '#f0fdf4', color: '#16a34a',
    borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
  },
  actions: { display: 'flex', gap: 8 },
  btnEdit: {
    background: '#fefce8', color: '#ca8a04', border: 'none',
    borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
  },
  btnDelete: {
    background: '#fef2f2', color: '#dc2626', border: 'none',
    borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' },
  spinner: {
    width: 36, height: 36, border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb', borderRadius: '50%',
  },
  errorBox: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: 8, padding: '14px 18px',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: '28px 32px',
    width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  btnCancel: {
    background: '#f1f5f9', color: '#475569', border: 'none',
    borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
  },
  btnDeleteConfirm: {
    background: '#dc2626', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
  },
};