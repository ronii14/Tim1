import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../../services/productService';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    getProduct(id)
      .then(res => setProduct(res.data.data ?? res.data))
      .catch(() => setError('Gagal memuat produk.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.center}><div style={styles.spinner} /></div>;
  if (error)   return <div style={styles.errorBox}>{error}</div>;
  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];
  const categories = product.categories || [];

  return (
    <div style={styles.page}>
      {/* Back */}
      <button style={styles.backBtn} onClick={() => navigate('/admin/products')}>
        ← Kembali ke Daftar Produk
      </button>

      <div style={styles.layout}>
        {/* Kiri: Gambar */}
        <div style={styles.imageSection}>
          <div style={styles.mainImageWrap}>
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.url || images[activeImage]?.image_url}
                alt={product.name}
                style={styles.mainImage}
                onError={e => { e.target.src = 'https://via.placeholder.com/400'; }}
              />
            ) : (
              <div style={styles.noImage}>Tidak ada gambar</div>
            )}
          </div>
          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((img, i) => (
                <img
                  key={img.id}
                  src={img.url || img.image_url}
                  alt=""
                  style={{
                    ...styles.thumb,
                    ...(i === activeImage ? styles.thumbActive : {})
                  }}
                  onClick={() => setActiveImage(i)}
                  onError={e => { e.target.src = 'https://via.placeholder.com/72'; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Kanan: Info */}
        <div style={styles.infoSection}>
          {/* Kategori */}
          <div style={styles.catRow}>
            {categories.length > 0
              ? categories.map(c => <span key={c.id} style={styles.catBadge}>{c.name}</span>)
              : <span style={{ color: '#94a3b8', fontSize: 13 }}>Tanpa kategori</span>
            }
          </div>

          <h1 style={styles.productName}>{product.name}</h1>

          <div style={styles.priceRow}>
            <span style={styles.price}>
              {product.price
                ? `Rp ${Number(product.price).toLocaleString('id-ID')}`
                : 'Harga belum diset'}
            </span>
            <span style={styles.stock}>Stok: {product.stock ?? '—'}</span>
          </div>

          {product.description && (
            <div style={styles.descSection}>
              <h3 style={styles.sectionTitle}>Deskripsi</h3>
              <p style={styles.desc}>{product.description}</p>
            </div>
          )}

          {/* Varian */}
          {variants.length > 0 && (
            <div style={styles.variantSection}>
              <h3 style={styles.sectionTitle}>Varian ({variants.length})</h3>
              <div style={styles.variantGrid}>
                {variants.map(v => (
                  <div key={v.id} style={styles.variantCard}>
                    <div style={styles.variantName}>{v.name}</div>
                    <div style={styles.variantValue}>{v.value}</div>
                    {v.price && (
                      <div style={styles.variantPrice}>
                        +Rp {Number(v.price).toLocaleString('id-ID')}
                      </div>
                    )}
                    {v.stock !== undefined && (
                      <div style={styles.variantStock}>Stok: {v.stock}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.btnEdit}
              onClick={() => navigate(`/admin/products/${id}/edit`)}
            >
              Edit Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 24px', fontFamily: 'sans-serif', color: '#1e293b' },
  backBtn: {
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', fontSize: 14, marginBottom: 20, display: 'block',
  },
  layout: { display: 'flex', gap: 40, flexWrap: 'wrap' },
  imageSection: { flex: '0 0 400px', maxWidth: 400 },
  mainImageWrap: {
    width: '100%', aspectRatio: '1', background: '#f8fafc',
    borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0',
  },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: {
    width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', fontSize: 14,
  },
  thumbRow: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  thumb: {
    width: 72, height: 72, objectFit: 'cover',
    borderRadius: 8, border: '2px solid #e2e8f0', cursor: 'pointer',
  },
  thumbActive: { border: '2px solid #2563eb' },
  infoSection: { flex: 1, minWidth: 280 },
  catRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catBadge: {
    background: '#eff6ff', color: '#2563eb', borderRadius: 99,
    padding: '4px 12px', fontSize: 12, fontWeight: 600,
  },
  productName: { fontSize: 28, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 },
  price: { fontSize: 24, fontWeight: 700, color: '#2563eb' },
  stock: {
    background: '#f0fdf4', color: '#16a34a',
    borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 600,
  },
  descSection: { marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 },
  desc: { fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 },
  variantSection: { marginBottom: 28 },
  variantGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  variantCard: {
    border: '1px solid #e2e8f0', borderRadius: 10,
    padding: '12px 16px', background: '#f8fafc', minWidth: 100,
  },
  variantName: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' },
  variantValue: { fontSize: 16, fontWeight: 700, margin: '4px 0' },
  variantPrice: { fontSize: 12, color: '#2563eb' },
  variantStock: { fontSize: 12, color: '#64748b', marginTop: 2 },
  actions: { display: 'flex', gap: 12 },
  btnEdit: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 28px', cursor: 'pointer',
    fontWeight: 600, fontSize: 15,
  },
  center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  spinner: {
    width: 36, height: 36, border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb', borderRadius: '50%',
  },
  errorBox: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: 8, padding: '14px 18px', margin: 32,
  },
};