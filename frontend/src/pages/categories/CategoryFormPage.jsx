import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategory, createCategory, updateCategory } from '../../services/categoryService';

export default function CategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getCategory(id)
        .then(res => {
          const c = res.data.data ?? res.data;
          setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '' });
        })
        .catch(() => setError('Gagal memuat data kategori.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Auto-generate slug dari name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({
      ...f,
      name,
      slug: f.slug === autoSlug(f.name) || !isEdit
        ? autoSlug(name)
        : f.slug,
    }));
  };

  const autoSlug = (str) =>
    str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name) return alert('Nama kategori wajib diisi.');
    try {
      setSaving(true);
      if (isEdit) {
        await updateCategory(id, form);
      } else {
        await createCategory(form);
      }
      alert(isEdit ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil dibuat!');
      navigate('/admin/categories');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan kategori.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.center}><div style={styles.spinner} /></div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <button style={styles.backBtn} onClick={() => navigate('/admin/categories')}>
        ← Kembali ke Daftar Kategori
      </button>
      <h1 style={styles.title}>{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</h1>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.card}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nama Kategori *</label>
          <input
            style={styles.input}
            name="name"
            value={form.name}
            onChange={handleNameChange}
            placeholder="e.g. Kaos"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Slug</label>
          <input
            style={{ ...styles.input, background: '#f8fafc', color: '#64748b' }}
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="auto-generated dari nama"
          />
          <span style={styles.hint}>Digunakan untuk URL. Otomatis dibuat dari nama.</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Deskripsi</label>
          <textarea
            style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi kategori (opsional)..."
          />
        </div>

        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={() => navigate('/admin/categories')}>
            Batal
          </button>
          <button style={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 24px', fontFamily: 'sans-serif', color: '#1e293b', maxWidth: 560 },
  backBtn: {
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', fontSize: 14, marginBottom: 8, display: 'block',
  },
  title: { fontSize: 24, fontWeight: 700, margin: '0 0 24px' },
  card: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: 28,
  },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' },
  footer: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #f1f5f9' },
  btnPrimary: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontWeight: 600,
  },
  btnCancel: {
    background: '#f1f5f9', color: '#475569', border: 'none',
    borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontWeight: 600,
  },
  center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  spinner: {
    width: 36, height: 36, border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb', borderRadius: '50%',
  },
  errorBox: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: 8, padding: '14px 18px', marginBottom: 20,
  },
};