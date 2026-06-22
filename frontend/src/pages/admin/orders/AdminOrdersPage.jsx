import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag, Loader2, RefreshCw, ChevronDown,
  Clock, CheckCircle, Package, Truck, Star, XCircle,
} from 'lucide-react';
import api from '../../../services/api';
import { formatRupiah } from '../../../utils/formatCurrency';

// ─── Status config ──────────────────────────────────────────
const STATUS = {
  pending:    { label: 'Menunggu',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  paid:       { label: 'Dibayar',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle },
  processing: { label: 'Diproses',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Package },
  shipped:    { label: 'Dikirim',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Truck },
  delivered:  { label: 'Selesai',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: Star },
  cancelled:  { label: 'Dibatalkan', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
  refunded:   { label: 'Refund',     color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: XCircle },
};

const STATUS_FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

// ─── Inline styles ────────────────────────────────────────────
const card = {
  background: '#101418',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px',
};

const th = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '14px',
  fontSize: '13px',
  color: '#cbd5e1',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  verticalAlign: 'middle',
};

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('');
  const [updating, setUpdating]     = useState(null); // order id being updated
  const [expandedId, setExpandedId] = useState(null);

  // tracking number modal
  const [trackingModal, setTrackingModal] = useState(null); // { order }
  const [trackingNo, setTrackingNo]       = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/admin/orders${params}`);
      setOrders(res.data?.data || []);
    } catch {
      toast.error('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusUpdate = async (order, newStatus) => {
    if (newStatus === order.status) return;

    // Shipped requires tracking number
    if (newStatus === 'shipped') {
      setTrackingModal({ order, newStatus });
      setTrackingNo('');
      return;
    }

    setUpdating(order.id);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus });
      toast.success(`Status diubah ke "${STATUS[newStatus]?.label}"`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setUpdating(null);
    }
  };

  const handleShipConfirm = async () => {
    if (!trackingNo.trim()) { toast.error('Nomor resi wajib diisi'); return; }
    setTrackingLoading(true);
    try {
      await api.patch(`/admin/orders/${trackingModal.order.id}/status`, {
        status: 'shipped',
        tracking_number: trackingNo,
      });
      toast.success('Pesanan berhasil dikirim');
      setTrackingModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update status');
    } finally {
      setTrackingLoading(false);
    }
  };

  // ─── Stat counts ─────────────────────────────────────────
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
            Riwayat Transaksi
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Kelola semua pesanan masuk
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
            fontSize: '13px', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {[{ value: '', label: 'Semua', count: orders.length }, ...STATUS_FLOW.map(s => ({ value: s, label: STATUS[s]?.label, count: counts[s] || 0 }))].map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
              border: filterStatus === value ? `1px solid ${value ? STATUS[value]?.color : '#f59e0b'}` : '1px solid rgba(255,255,255,0.08)',
              background: filterStatus === value ? (value ? STATUS[value]?.bg : 'rgba(245,158,11,0.12)') : 'transparent',
              color: filterStatus === value ? (value ? STATUS[value]?.color : '#f59e0b') : '#64748b',
              cursor: 'pointer',
            }}
          >
            {label} {count > 0 && `(${count})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <ShoppingBag size={32} color="#334155" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#475569', fontSize: '13px' }}>Belum ada pesanan</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Pelanggan</th>
                  <th style={th}>Total</th>
                  <th style={th}>Pembayaran</th>
                  <th style={th}>Status</th>
                  <th style={th}>Tanggal</th>
                  <th style={th}>Ubah Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = STATUS[order.status] || STATUS.pending;
                  const StIcon = st.icon;
                  const isExpanded = expandedId === order.id;

                  return (
                    <>
                      <tr key={order.id}>
                        {/* Customer */}
                        <td style={td}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#f1f5f9', fontSize: '13px' }}>
                            {order.user?.name || '—'}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569' }}>
                            {order.user?.email}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569' }}>
                            {order.items_count} item{order.items_count > 1 ? 's' : ''}
                          </p>
                        </td>

                        {/* Total */}
                        <td style={td}>
                          <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                            {formatRupiah(order.total)}
                          </span>
                          {order.discount > 0 && (
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#22c55e' }}>
                              diskon {formatRupiah(order.discount)}
                            </p>
                          )}
                        </td>

                        {/* Payment */}
                        <td style={td}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
                            {order.payment?.payment_method?.replace('_', ' ') || '—'}
                          </span>
                          <br />
                          <span style={{
                            fontSize: '11px', fontWeight: 600,
                            color: order.payment?.status === 'success' ? '#22c55e' :
                                   order.payment?.status === 'failed' ? '#ef4444' : '#f59e0b',
                          }}>
                            {order.payment?.status === 'success' ? 'Lunas' :
                             order.payment?.status === 'failed' ? 'Gagal' : 'Pending'}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td style={td}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', borderRadius: '6px',
                            fontSize: '11px', fontWeight: 700,
                            background: st.bg, color: st.color,
                          }}>
                            <StIcon size={11} />
                            {st.label}
                          </span>
                          {order.tracking_number && (
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                              Resi: {order.tracking_number}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* Status select */}
                        <td style={td}>
                          {updating === order.id ? (
                            <Loader2 size={16} className="animate-spin" color="#f59e0b" />
                          ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order, e.target.value)}
                                style={{
                                  padding: '6px 28px 6px 10px',
                                  borderRadius: '7px',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  background: '#1a1d23',
                                  color: '#e2e8f0',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  appearance: 'none',
                                  outline: 'none',
                                }}
                              >
                                {STATUS_FLOW.map((s) => (
                                  <option key={s} value={s}>{STATUS[s]?.label}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} color="#64748b" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                          )}
                        </td>

                        {/* Expand detail */}
                        <td style={td}>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.04)',
                              color: '#94a3b8', cursor: 'pointer',
                            }}
                          >
                            {isExpanded ? 'Tutup' : 'Detail'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row — order items + address */}
                      {isExpanded && (
                        <tr key={`${order.id}-detail`}>
                          <td colSpan={7} style={{ padding: '0 14px 14px', borderTop: 'none' }}>
                            <div style={{
                              background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                              padding: '16px', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                                {/* Items */}
                                <div style={{ flex: 1, minWidth: '220px' }}>
                                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Item</p>
                                  {order.items?.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                      <span style={{ color: '#cbd5e1' }}>{item.name} ×{item.quantity}</span>
                                      <span style={{ color: '#94a3b8' }}>{formatRupiah(item.unit_price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Address */}
                                {order.address && (
                                  <div style={{ minWidth: '180px' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Alamat</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                                      {order.address.recipient}<br />
                                      {order.address.full_address}<br />
                                      {order.address.city}, {order.address.province} {order.address.postal_code}
                                    </p>
                                  </div>
                                )}

                                {/* Price breakdown */}
                                <div style={{ minWidth: '160px' }}>
                                  <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rincian</p>
                                  <Row label="Subtotal" val={formatRupiah(order.subtotal)} />
                                  {order.discount > 0 && <Row label="Diskon" val={`-${formatRupiah(order.discount)}`} valColor="#22c55e" />}
                                  <Row label="Ongkir" val={formatRupiah(order.shipping_cost)} />
                                  <Row label="Total" val={formatRupiah(order.total)} valColor="#f59e0b" bold />
                                </div>

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tracking number modal */}
      {trackingModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#12151c', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '28px', width: '100%', maxWidth: '420px',
          }}>
            <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: '16px', fontWeight: 700 }}>
              Nomor Resi Pengiriman
            </h3>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>
              Pesanan: {trackingModal.order.user?.name}
            </p>
            <input
              type="text"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              placeholder="Contoh: JNE1234567890"
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleShipConfirm(); }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setTrackingModal(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '9px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                  fontSize: '13px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleShipConfirm}
                disabled={trackingLoading}
                style={{
                  flex: 2, padding: '11px', borderRadius: '9px',
                  border: 'none', background: '#f59e0b', color: '#000',
                  fontSize: '13px', cursor: trackingLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {trackingLoading ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : 'Simpan & Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, val, valColor, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: valColor || '#94a3b8', fontWeight: bold ? 700 : 500 }}>{val}</span>
    </div>
  );
}
