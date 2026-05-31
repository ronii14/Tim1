import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, createProduct, updateProduct, syncCategories } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { createVariant, updateVariant, deleteVariant } from '../../services/variantService';
import { uploadImage, deleteImage } from '../../services/imageService';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', value: '', price: '', stock: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [productId, setProductId] = useState(id || null);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.data ?? res.data)).catch(() => {});
    if (isEdit) {
      setLoading(true);
      getProduct(id)
        .then(res => {
          const p = res.data.data ?? res.data;
          setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock || '' });
          setSelectedCats((p.categories || []).map(c => c.id));
          setVariants(p.variants || []);
          setImages(p.images || []);
          setProductId(p.id);
        })
        .catch(() => setError('Gagal memuat data produk.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleCat = (catId) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSaveInfo = async () => {
    if (!form.name) return alert('Nama produk wajib diisi.');
    try {
      setSaving(true);
      let pid = productId;
      if (isEdit) {
        await updateProduct(id, form);
      } else {
        const res = await createProduct(form);
        pid = (res.data.data ?? res.data).id;
        setProductId(pid);
      }
      await syncCategories(pid, selectedCats);
      alert(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil dibuat!');
      if (!isEdit) navigate(`/admin/products/${pid}/edit`);
    } catch {
      alert('Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name) return alert('Nama varian wajib diisi.');
    if (!productId) return alert('Simpan info produk terlebih dahulu.');
    try {
      const res = await createVariant(productId, newVariant);
      setVariants(v => [...v, res.data.data ?? res.data]);
      setNewVariant({ name: '', value: '', price: '', stock: '' });
    } catch { alert('Gagal menambah varian.'); }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!confirm('Hapus varian ini?')) return;
    try {
      await deleteVariant(productId, variantId);
      setVariants(v => v.filter(x => x.id !== variantId));
    } catch { alert('Gagal menghapus varian.'); }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!productId) return alert('Simpan info produk terlebih dahulu.');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadImage(productId, formData);
      setImages(imgs => [...imgs, res.data.data ?? res.data]);
    } catch { alert('Gagal upload gambar.'); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Hapus gambar ini?')) return;
    try {
      await deleteImage(productId, imageId);
      setImages(imgs => imgs.filter(x => x.id !== imageId));
    } catch { alert('Gagal menghapus gambar.'); }
  };

  if (loading) return (
    <div style={styles.center}><div style={styles.spinner} /></div>
  );

  const tabs = ['info', 'varian', 'gambar'];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/admin/products')}>
            ← Kembali
          </button>
          <h1 style={styles.title}>{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' ? 'Info Produk' : tab === 'varian' ? 'Varian' : 'Gambar'}
            {tab === 'varian' && variants.length > 0 && (
              <span style={styles.tabBadge}>{variants.length}</span>
            )}
            {tab === 'gambar' && images.length > 0 && (
              <span style={styles.tabBadge}>{images.length}</span>
            )}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {/* TAB: INFO */}
        {activeTab === 'info' && (
          <div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Produk *</label>
                <input
                  style={styles.input}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Harga (Rp)</label>
                <input
                  style={styles.input}
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stok</label>
                <input
                  style={styles.input}
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: 16 }}>
              <label style={styles.label}>Deskripsi</label>
              <textarea
                style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Deskripsi produk..."
              />
            </div>

            {/* Kategori */}
            <div style={{ marginTop: 20 }}>
              <label style={styles.label}>Kategori</label>
              <div style={styles.catWrap}>
                {categories.length === 0
                  ? <span style={{ color: '#94a3b8', fontSize: 13 }}>Belum ada kategori.</span>
                  : categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      style={{
                        ...styles.catChip,
                        ...(selectedCats.includes(c.id) ? styles.catChipActive : {})
                      }}
                      onClick={() => toggleCat(c.id)}
                    >
                      {c.name}
                    </button>
                  ))
                }
              </div>
            </div>

            <div style={styles.formFooter}>
              <button style={styles.btnCancel} onClick={() => navigate('/admin/products')}>
                Batal
              </button>
              <button style={styles.btnPrimary} onClick={handleSaveInfo} disabled={saving}>
                {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: VARIAN */}
        {activeTab === 'varian' && (
          <div>
            {!productId && (
              <div style={styles.infoBox}>Simpan info produk terlebih dahulu sebelum menambah varian.</div>
            )}
            {/* Form tambah varian */}
            <div style={styles.variantFormGrid}>
              {[
                { key: 'name', label: 'Nama Varian', placeholder: 'e.g. Ukuran' },
                { key: 'value', label: 'Nilai', placeholder: 'e.g. XL' },
                { key: 'price', label: 'Harga Tambahan', placeholder: '0', type: 'number' },
                { key: 'stock', label: 'Stok', placeholder: '0', type: 'number' },
              ].map(f => (
                <div key={f.key} style={styles.formGroup}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    style={styles.input}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={newVariant[f.key]}
                    onChange={e => setNewVariant(v => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button
              style={{ ...styles.btnPrimary, marginBottom: 24 }}
              onClick={handleAddVariant}
              disabled={!productId}
            >
              + Tambah Varian
            </button>

            {/* List varian */}
            {variants.length === 0
              ? <p style={{ color: '#94a3b8' }}>Belum ada varian.</p>
              : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Nama', 'Nilai', 'Harga', 'Stok', ''].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map(v => (
                      <tr key={v.id} style={styles.tr}>
                        <td style={styles.td}>{v.name}</td>
                        <td style={styles.td}>{v.value}</td>
                        <td style={styles.td}>{v.price ? `Rp ${Number(v.price).toLocaleString('id-ID')}` : '—'}</td>
                        <td style={styles.td}>{v.stock ?? '—'}</td>
                        <td style={styles.td}>
                          <button style={styles.btnDelete} onClick={() => handleDeleteVariant(v.id)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* TAB: GAMBAR */}
        {activeTab === 'gambar' && (
          <div>
            {!productId && (
              <div style={styles.infoBox}>Simpan info produk terlebih dahulu sebelum upload gambar.</div>
            )}
            <label style={{ ...styles.btnPrimary, display: 'inline-block', cursor: 'pointer', marginBottom: 24 }}>
              + Upload Gambar
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadImage} disabled={!productId} />
            </label>

            {images.length === 0
              ? <p style={{ color: '#94a3b8' }}>Belum ada gambar.</p>
              : (
                <div style={styles.imageGrid}>
                  {images.map(img => (
                    <div key={img.id} style={styles.imageCard}>
                      <img
                        src={img.url || img.image_url}
                        alt="product"
                        style={styles.image}
                        onError={e => { e.target.src = 'https://via.placeholder.com/160'; }}
                      />
                      <button style={styles.imageDelete} onClick={() => handleDeleteImage(img.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 24px', fontFamily: 'sans-serif', color: '#1e293b', maxWidth: 860 },
  header: { marginBottom: 24 },
  backBtn: {
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', fontSize: 14, padding: '0 0 8px', display: 'block',
  },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  tabs: { display: 'flex', gap: 4, marginBottom: 0, borderBottom: '2px solid #e2e8f0' },
  tab: {
    background: 'none', border: 'none', padding: '10px 20px',
    cursor: 'pointer', fontSize: 14, color: '#64748b',
    fontWeight: 500, borderBottom: '2px solid transparent',
    marginBottom: -2, transition: 'all .15s',
  },
  tabActive: { color: '#2563eb', borderBottom: '2px solid #2563eb', fontWeight: 700 },
  tabBadge: {
    display: 'inline-block', background: '#2563eb', color: '#fff',
    borderRadius: 99, padding: '1px 7px', fontSize: 11, marginLeft: 6,
  },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 28 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  variantFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none',
    transition: 'border .15s', fontFamily: 'inherit',
  },
  catWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  catChip: {
    border: '1px solid #e2e8f0', background: '#f8fafc',
    borderRadius: 99, padding: '6px 14px', cursor: 'pointer',
    fontSize: 13, color: '#475569', transition: 'all .15s',
  },
  catChipActive: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 600 },
  formFooter: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' },
  btnPrimary: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 22px', cursor: 'pointer',
    fontWeight: 600, fontSize: 14,
  },
  btnCancel: {
    background: '#f1f5f9', color: '#475569', border: 'none',
    borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontWeight: 600,
  },
  btnDelete: {
    background: '#fef2f2', color: '#dc2626', border: 'none',
    borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '10px 14px',
    background: '#f8fafc', color: '#64748b',
    fontWeight: 600, fontSize: 12, borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px' },
  infoBox: {
    background: '#fefce8', color: '#92400e', border: '1px solid #fde68a',
    borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13,
  },
  imageGrid: { display: 'flex', flexWrap: 'wrap', gap: 16 },
  imageCard: { position: 'relative', width: 160, height: 160 },
  image: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' },
  imageDelete: {
    position: 'absolute', top: 6, right: 6, background: '#dc2626',
    color: '#fff', border: 'none', borderRadius: 99, width: 24, height: 24,
    cursor: 'pointer', fontSize: 12, lineHeight: '24px', textAlign: 'center',
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