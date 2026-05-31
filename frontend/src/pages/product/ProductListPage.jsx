import { useState } from 'react';
import { Search } from 'lucide-react';
import products from "../../components/product/products";
import ProductCard from "../../components/product/ProductCard"

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090c',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            margin: '0 0 6px',
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}>
            Semua Produk
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            {filtered.length} produk tersedia
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '32px',
          alignItems: 'center',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                background: '#121318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                  background: activeCategory === cat ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: activeCategory === cat ? '#f59e0b' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            color: '#475569',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>
              Produk tidak ditemukan
            </p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Coba kata kunci lain atau hapus filter
            </p>
          </div>
        )}

      </div>
    </div>
  );
}