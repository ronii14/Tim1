import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Package, AlertTriangle, Loader2, ChevronRight, Clock } from 'lucide-react';
import orderService from '../../services/orderService';
import { formatRupiah } from '../../utils/formatCurrency';

const statusConfig = {
  pending:    { label: 'Menunggu Pembayaran', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  paid:       { label: 'Dibayar',              color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  processing: { label: 'Diproses',             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  shipped:    { label: 'Dikirim',              color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  delivered:  { label: 'Selesai',              color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  cancelled:  { label: 'Dibatalkan',           color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  refunded:   { label: 'Dikembalikan',         color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrders();
      setOrders(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat pesanan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
          <Loader2 size={32} className="animate-spin" color="#f59e0b" />
          <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '14px' }}>Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>
            Gagal Memuat Pesanan
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>{error}</p>
          <button
            onClick={fetchOrders}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: '#f59e0b', color: '#000', fontSize: '13px',
              cursor: 'pointer', fontWeight: 700,
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            Pesanan Saya
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
            {orders.length > 0 ? `${orders.length} pesanan` : 'Belum ada pesanan'}
          </p>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Package size={28} color="#64748b" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>
              Belum Ada Pesanan
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>
              Ayo mulai belanja dan buat pesanan pertama kamu!
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
        ) : (
          /* Order list */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const itemCount = order.items_count || 0;

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: '#101010',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.background = '#151515'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#101010'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Status badge + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: status.bg,
                        color: status.color,
                      }}>
                        {status.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {new Date(order.created_at || order.ordered_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {itemCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {itemCount} item{itemCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {order.payment?.payment_method && (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {order.payment.payment_method.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: total + arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#ffb000', fontWeight: 800, fontSize: '15px' }}>
                        {formatRupiah(order.total)}
                      </span>
                    </div>
                    <ChevronRight size={16} color="#64748b" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default OrderHistoryPage;
