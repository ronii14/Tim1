import { useState } from 'react';
import { ShoppingCart, X, Star } from 'lucide-react';

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

function ProductModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState('L');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#121318',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          gap: '0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94a3b8',
          }}
        >
          <X size={18} />
        </button>

        {/* Gambar */}
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxHeight: '85vh' }}>

          {/* Badge */}
          {product.badge && (
            <div style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
              color: '#f59e0b', marginBottom: '10px',
            }}>
              {product.badge.toUpperCase()}
            </div>
          )}

          {/* Nama */}
          <h2 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            {product.name}
          </h2>

          {/* Harga */}
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginBottom: '12px' }}>
            {formatRupiah(product.price)}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating) ? '#f59e0b' : 'none'}
                stroke={i < Math.round(product.rating) ? '#f59e0b' : '#475569'}
              />
            ))}
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>({product.reviews} ulasan pembeli)</span>
          </div>

          {/* Deskripsi */}
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* Pilih Ukuran */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#64748b', marginBottom: '10px' }}>
              PILIH UKURAN KAOS:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: '44px', height: '44px',
                    borderRadius: '10px', border: '1px solid',
                    borderColor: selectedSize === size ? '#f59e0b' : 'rgba(255,255,255,0.12)',
                    background: selectedSize === size ? 'rgba(245,158,11,0.15)' : 'transparent',
                    color: selectedSize === size ? '#f59e0b' : '#94a3b8',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Spesifikasi */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#64748b', marginBottom: '10px' }}>
              SPESIFIKASI KAOS:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(product.specs || []).map((spec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f59e0b', fontSize: '14px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stok */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: product.stock > 5 ? '#4ade80' : '#fbbf24',
              background: product.stock > 5 ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
              padding: '4px 12px', borderRadius: '20px',
            }}>
              Stok: {product.stock}
            </span>
          </div>

          {/* Tombol */}
          <button
            disabled={product.stock === 0}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              background: product.stock === 0 ? 'rgba(255,255,255,0.05)' : '#f59e0b',
              color: product.stock === 0 ? '#475569' : '#000',
              fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isOutOfStock = product.stock === 0;

  return (
    <>
      {showModal && <ProductModal product={product} onClose={() => setShowModal(false)} />}

      <div
        onClick={() => setShowModal(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#121318',
          border: `1px solid ${hovered ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '4/3',
          background: 'rgba(255,255,255,0.04)', overflow: 'hidden',
        }}>
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.3s',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px' }}>👕</span>
            </div>
          )}

          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '20px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 600, color: '#f59e0b',
          }}>
            {product.category}
          </div>

          {isOutOfStock && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>Habis</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
              {formatRupiah(product.price)}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
              color: product.stock > 5 ? '#4ade80' : product.stock > 0 ? '#fbbf24' : '#f87171',
              background: product.stock > 5 ? 'rgba(74,222,128,0.1)' : product.stock > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
            }}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
            </span>
          </div>
          <button
            disabled={isOutOfStock}
            onClick={(e) => { e.stopPropagation(); }}
            style={{
              marginTop: '6px', width: '100%', padding: '10px',
              borderRadius: '10px', border: 'none',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: isOutOfStock ? 'rgba(255,255,255,0.05)' : hovered ? '#f59e0b' : 'rgba(245,158,11,0.15)',
              color: isOutOfStock ? '#475569' : hovered ? '#000' : '#f59e0b',
              fontSize: '13px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </>
  );
}