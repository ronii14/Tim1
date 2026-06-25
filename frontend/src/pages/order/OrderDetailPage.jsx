import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Loader2, AlertTriangle, Package, MapPin, CreditCard,
  Truck, Clock, CheckCircle, XCircle, Banknote,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { formatRupiah } from '../../utils/formatCurrency';
import api from '../../services/api';

const statusConfig = {
  pending:    { label: 'Menunggu Pembayaran', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  paid:       { label: 'Dibayar',              color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
  processing: { label: 'Diproses',             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Package },
  shipped:    { label: 'Dikirim',              color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Truck },
  delivered:  { label: 'Selesai',              color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
  cancelled:  { label: 'Dibatalkan',           color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
  refunded:   { label: 'Dikembalikan',         color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: XCircle },
};

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrder(id);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Pesanan tidak ditemukan.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat detail pesanan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(id);
      setOrder(res.data);
      toast.success('Pesanan dibatalkan.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSimulatePayment = async (status) => {
    if (!order?.payment?.ref_code) {
      toast.error('Referensi pembayaran tidak ditemukan.');
      return;
    }
    setSimulating(true);
    try {
      const res = await api.post(`/payments/${order.payment.ref_code}/simulate`, { status });
      setOrder((prev) => ({
        ...prev,
        payment: res.data.data,
        status: res.data.data.order?.status || prev.status,
      }));
      toast.success(status === 'success' ? 'Pembayaran berhasil!' : 'Pembayaran gagal.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses simulasi pembayaran.');
    } finally {
      setSimulating(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090c', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
          <Loader2 size={32} className="animate-spin" color="#f59e0b" />
          <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '14px' }}>Memuat detail pesanan...</p>
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
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>Pesanan Tidak Ditemukan</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>{error}</p>
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Kembali ke Pesanan
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPending = order.status === 'pending';
  const isPaymentPending = order.payment?.status === 'pending';

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/orders')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#94a3b8',
            fontSize: '13px', cursor: 'pointer', padding: '0 0 ',
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Pesanan
        </button>

        {/* Status Header */}
        <div style={{
          background: '#101010',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: status.bg, border: `1px solid ${status.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <StatusIcon size={22} color={status.color} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {status.label}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                {new Date(order.created_at || order.ordered_at).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Order Items */}
          <Section title="Item Pesanan" icon={Package}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,.85)', fontSize: '13px', fontWeight: 500 }}>
                    {item.name}
                  </p>
                  <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,.4)', fontSize: '11px' }}>
                    {item.quantity} × {formatRupiah(item.unit_price)}
                  </p>
                </div>
                <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>
                  {formatRupiah(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </Section>

          {/* Shipping Address */}
          {order.address && (
            <Section title="Alamat Pengiriman" icon={MapPin}>
              <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                {order.address.recipient || order.address.label}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                {order.address.full_address}, {order.address.city}, {order.address.province}
                {order.address.postal_code ? ` ${order.address.postal_code}` : ''}
              </p>
              {order.address.phone && (
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                  {order.address.phone}
                </p>
              )}
            </Section>
          )}

          {/* Payment Info */}
          {order.payment && (
            <Section title="Pembayaran" icon={CreditCard}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Metode</span>
                <span style={{ color: '#fff', textAlign: 'right', textTransform: 'uppercase' }}>
                  {order.payment.payment_method?.replace('_', ' ')}
                </span>

                <span style={{ color: '#94a3b8' }}>Status</span>
                <span style={{ color: '#fff', textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                    fontSize: '11px', fontWeight: 600,
                    background: order.payment.status === 'success' ? 'rgba(34,197,94,0.12)' :
                                order.payment.status === 'failed' ? 'rgba(239,68,68,0.12)' :
                                'rgba(245,158,11,0.12)',
                    color: order.payment.status === 'success' ? '#22c55e' :
                           order.payment.status === 'failed' ? '#ef4444' : '#f59e0b',
                  }}>
                    {order.payment.status === 'success' ? 'Lunas' :
                     order.payment.status === 'failed' ? 'Gagal' : 'Pending'}
                  </span>
                </span>

                {order.payment.va_number && (
                  <>
                    <span style={{ color: '#94a3b8' }}>VA Number</span>
                    <span style={{ color: '#f59e0b', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: '15px' }}>
                      {order.payment.va_number}
                    </span>
                  </>
                )}

                {order.payment.expired_at && (
                  <>
                    <span style={{ color: '#94a3b8' }}>Berlaku hingga</span>
                    <span style={{ color: '#94a3b8', textAlign: 'right', fontSize: '12px' }}>
                      {new Date(order.payment.expired_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </>
                )}
              </div>
            </Section>
          )}

          {/* Price Summary */}
          <Section title="Rincian Harga" icon={Banknote}>
            <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
            {order.discount > 0 && (
              <Row label="Diskon" value={`-${formatRupiah(order.discount)}`} valueColor="#22c55e" />
            )}
            <Row label="Ongkos Kirim" value={formatRupiah(order.shipping_cost)} />
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: '10px', marginTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '13px', fontWeight: 600 }}>Total</span>
              <span style={{ color: '#ffb000', fontWeight: 800, fontSize: '16px' }}>
                {formatRupiah(order.total)}
              </span>
            </div>
          </Section>

          {/* Notes */}
          {order.notes && (
            <Section title="Catatan" icon={AlertTriangle}>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                "{order.notes}"
              </p>
            </Section>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {/* Cancel order (only when pending) */}
            {isPending && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '13px',
                  fontWeight: 700, cursor: cancelling ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
              </button>
            )}

            {/* Simulate payment (only when payment is pending) */}
            {isPaymentPending && (
              <>
                <button
                  onClick={() => handleSimulatePayment('success')}
                  disabled={simulating}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: '#22c55e', color: '#000', fontSize: '13px',
                    fontWeight: 700, cursor: simulating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  {simulating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {simulating ? 'Memproses...' : 'Simulasi Bayar Sukses'}
                </button>
                <button
                  onClick={() => handleSimulatePayment('failed')}
                  disabled={simulating}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '13px',
                    fontWeight: 700, cursor: simulating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  {simulating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {simulating ? 'Memproses...' : 'Simulasi Bayar Gagal'}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{
      background: '#101010',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '20px',
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          {Icon && <Icon size={15} color="#f59e0b" />}
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0', fontSize: '13px',
    }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: valueColor || 'rgba(255,255,255,.7)', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

export default OrderDetailPage;
