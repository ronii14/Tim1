import { useState, useEffect } from "react";

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: '#0a0b0f',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: '6px',
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const ProductForm = ({ product, onSubmit }) => {
  const [form, setForm] = useState({
    name: '', price: '', stock: '', description: '', image: null,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        description: product.description || '',
        image: null,
      });
    } else {
      setForm({ name: '', price: '', stock: '', description: '', image: null });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    if (!product) setForm({ name: '', price: '', stock: '', description: '', image: null });
  };

  const focus = (e) => (e.target.style.borderColor = 'rgba(245,158,11,0.5)');
  const blur  = (e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)');

  return (
    <div style={{
      background: '#121318',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
        {product ? '✏️ Edit Produk' : '➕ Tambah Produk'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Baris 1: Nama + Harga */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Field label="Nama Produk">
            <input
              type="text"
              placeholder="Masukkan nama produk"
              value={form.name}
              required
              style={inputStyle}
              onFocus={focus} onBlur={blur}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Harga (Rp)">
            <input
              type="number"
              placeholder="Contoh: 150000"
              value={form.price}
              required
              style={inputStyle}
              onFocus={focus} onBlur={blur}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
        </div>

        {/* Baris 2: Stok + Foto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Field label="Stok">
            <input
              type="number"
              placeholder="Jumlah stok"
              value={form.stock}
              required
              style={inputStyle}
              onFocus={focus} onBlur={blur}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </Field>

          <Field label="Foto Produk">
            <input
              type="file"
              accept="image/*"
              style={{ ...inputStyle, padding: '7px 14px', cursor: 'pointer', color: '#94a3b8' }}
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />
          </Field>
        </div>

        {/* Baris 3: Deskripsi full width */}
        <div style={{ marginBottom: '16px' }}>
          <Field label="Deskripsi Produk">
            <textarea
              placeholder="Tuliskan deskripsi produk..."
              value={form.description}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '90px', lineHeight: 1.6 }}
              onFocus={focus} onBlur={blur}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>

        {/* Tombol */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: '8px',
              color: '#f59e0b',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {product ? 'Update Produk' : 'Simpan Produk'}
          </button>

          {product && (
            <button
              type="button"
              onClick={() => onSubmit(null)}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;