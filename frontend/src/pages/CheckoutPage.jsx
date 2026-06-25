import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, AlertTriangle, Loader2, ShoppingCart } from 'lucide-react';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummary from '../components/checkout/OrderSummary';
import cartService from '../services/cartService';
import { storageUrl } from '../services/config';

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [loading, setLoading] = useState(!location.state?.cartItems);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If cart items not passed via navigation state, fetch from API
    if (!location.state?.cartItems) {
      fetchCart();
    }
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      const items = (res.data || []).map((item) => ({
        id: item.id,
        name: item.product?.name || 'Produk tidak ditemukan',
        size: item.variant?.name || 'Default',
        price: item.product?.price || 0,
        quantity: item.quantity,
        stock: item.variant?.stock ?? item.product?.stock ?? 0,
        image: item.product?.images?.[0]?.url
          ? storageUrl(item.product.images[0].url)
          : 'https://placehold.co/64x64/27272a/71717a?text=IMG',
        cartItemId: item.id,
      }));
      setCartItems(items);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat keranjang.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" color="#f59e0b" />
            <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '14px' }}>Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
            Gagal Memuat Keranjang
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/cart')}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Kembali ke Keranjang
            </button>
            <button
              onClick={fetchCart}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: '#f59e0b', color: '#000', fontSize: '13px',
                cursor: 'pointer', fontWeight: 700,
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShoppingCart size={28} color="#64748b" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
            Keranjang Kosong
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>
            Tambahkan produk terlebih dahulu sebelum checkout.
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 28px', borderRadius: '10px', border: 'none',
              background: '#f59e0b', color: '#000', fontSize: '14px',
              cursor: 'pointer', fontWeight: 700,
            }}
          >
            Mulai Belanja
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/cart')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#94a3b8',
            fontSize: '13px', cursor: 'pointer', padding: '0 0 20px',
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Keranjang
        </button>

        {/* Title */}
        <h1 style={{ margin: '0 0 24px', fontSize: '26px', fontWeight: 800, color: '#fff' }}>
          Checkout
        </h1>

        <div style={{ display: 'flex', gap: '28px', flexDirection: 'row', alignItems: 'flex-start' }} className="flex-col lg:flex-row">
          {/* Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              background: '#101010',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '28px',
            }}>
              <CheckoutForm cartItems={cartItems} />
            </div>
          </div>

          {/* Summary sidebar */}
          <div style={{ width: '380px', flexShrink: 0 }} className="w-full lg:w-[380px]">
            <OrderSummary cartItems={cartItems} subtotal={subtotal} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;
