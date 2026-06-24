import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, MapPin, CreditCard, Truck, FileText, Plus, X } from 'lucide-react';
import addressService from '../../services/addressService';
import orderService from '../../services/orderService';

function CheckoutForm({ cartItems, onOrderPlaced }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('regular');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Add address inline
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: '',
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    full_address: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await addressService.getAddresses();
      const list = res.data || [];
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default);
      if (defaultAddr) setAddressId(defaultAddr.id);
    } catch (err) {
      toast.error('Gagal memuat alamat');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!addressId) errs.addressId = 'Pilih alamat pengiriman';
    if (!paymentMethod) errs.paymentMethod = 'Pilih metode pembayaran';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        address_id: addressId,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        notes: notes || undefined,
      };

      const res = await orderService.placeOrder(payload);
      toast.success('Pesanan berhasil dibuat!');
      if (onOrderPlaced) onOrderPlaced(res.data);
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.message) {
        toast.error(resp.message);
      } else {
        toast.error('Gagal membuat pesanan. Coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAddress = async () => {
    const required = ['recipient', 'phone', 'province', 'city', 'district', 'postal_code', 'full_address'];
    const missing = required.filter((f) => !newAddr[f].trim());
    if (missing.length > 0) {
      toast.error('Lengkapi semua field alamat');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await addressService.createAddress({
        ...newAddr,
        is_default: addresses.length === 0,
      });
      toast.success('Alamat berhasil ditambahkan');
      setShowAddAddress(false);
      setNewAddr({ label: '', recipient: '', phone: '', province: '', city: '', district: '', postal_code: '', full_address: '' });
      await fetchAddresses();
      // Auto-select new address
      if (res.data?.id) setAddressId(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setSavingAddress(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const errorStyle = {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
  };

  const shippingOptions = [
    { value: 'regular', label: 'Reguler (3-5 hari)', cost: 15000 },
    { value: 'express', label: 'Express (1-2 hari)', cost: 30000 },
    { value: 'same_day', label: 'Same Day', cost: 50000 },
  ];

  const paymentOptions = [
    { value: 'transfer_bca', label: 'Transfer BCA' },
    { value: 'transfer_mandiri', label: 'Transfer Mandiri' },
    { value: 'gopay', label: 'GoPay' },
    { value: 'cod', label: 'COD (Bayar di Tempat)' },
  ];

  const selectedShipping = shippingOptions.find((s) => s.value === shippingMethod);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = selectedShipping?.cost || 0;
  const total = subtotal + shippingCost;

  return (
    <form onSubmit={handleSubmit}>
      {/* Shipping Address */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MapPin size={16} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            Alamat Pengiriman
          </h3>
        </div>

        {loadingAddresses ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', color: '#94a3b8', fontSize: '13px' }}>
            <Loader2 size={14} className="animate-spin" />
            Memuat alamat...
          </div>
        ) : addresses.length === 0 && !showAddAddress ? (
          <div>
            <div style={{ padding: '14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', color: '#fca5a5', marginBottom: '12px' }}>
              Belum ada alamat. Tambah alamat baru untuk melanjutkan.
            </div>
            <button
              type="button"
              onClick={() => setShowAddAddress(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '10px', border: '2px dashed rgba(245,158,11,0.4)',
                background: 'rgba(245,158,11,0.06)', color: '#f59e0b',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                width: '100', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
            >
              <Plus size={16} />
              Tambah Alamat Baru
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: `2px solid ${addressId === addr.id ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    background: addressId === addr.id ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={addressId === addr.id}
                    onChange={() => setAddressId(addr.id)}
                    style={{ marginTop: '3px', accentColor: '#f59e0b' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      {addr.recipient || addr.label}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                      {addr.full_address}, {addr.city}, {addr.province}
                      {addr.postal_code ? ` ${addr.postal_code}` : ''}
                    </p>
                    {addr.phone && (
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        {addr.phone}
                      </p>
                    )}
                    {addr.is_default && (
                      <span style={{
                        display: 'inline-block', marginTop: '5px',
                        padding: '2px 8px', borderRadius: '4px',
                        fontSize: '10px', fontWeight: 600,
                        background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                      }}>
                        UTAMA
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {!showAddAddress && (
              <button
                type="button"
                onClick={() => setShowAddAddress(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginTop: '10px', padding: '8px 14px',
                  borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.15)',
                  background: 'none', color: '#94a3b8',
                  fontSize: '12px', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                <Plus size={14} />
                Tambah Alamat Lain
              </button>
            )}
          </>
        )}

        {/* Inline Add Address Form */}
        {showAddAddress && (
          <div style={{
            marginTop: '12px', padding: '18px',
            borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>Alamat Baru</span>
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label="Nama Penerima" value={newAddr.recipient} onChange={(v) => setNewAddr({ ...newAddr, recipient: v })} placeholder="John Doe" />
              <Field label="No. Telepon" value={newAddr.phone} onChange={(v) => setNewAddr({ ...newAddr, phone: v })} placeholder="081234567890" />
              <Field label="Provinsi" value={newAddr.province} onChange={(v) => setNewAddr({ ...newAddr, province: v })} placeholder="DKI Jakarta" />
              <Field label="Kota" value={newAddr.city} onChange={(v) => setNewAddr({ ...newAddr, city: v })} placeholder="Jakarta Selatan" />
              <Field label="Kecamatan" value={newAddr.district} onChange={(v) => setNewAddr({ ...newAddr, district: v })} placeholder="Kebayoran Baru" />
              <Field label="Kode Pos" value={newAddr.postal_code} onChange={(v) => setNewAddr({ ...newAddr, postal_code: v })} placeholder="12120" />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px' }}>Alamat Lengkap</label>
              <textarea
                value={newAddr.full_address}
                onChange={(e) => setNewAddr({ ...newAddr, full_address: e.target.value })}
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW"
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px' }}>Label (opsional)</label>
              <input
                type="text"
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                placeholder="Rumah / Kantor"
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveAddress}
              disabled={savingAddress}
              style={{
                width: '100%', marginTop: '14px', padding: '12px',
                borderRadius: '10px', border: 'none',
                background: savingAddress ? 'rgba(245,158,11,0.5)' : '#f59e0b',
                color: '#000', fontSize: '14px', fontWeight: 700,
                cursor: savingAddress ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              {savingAddress ? (
                <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
              ) : (
                'Simpan Alamat'
              )}
            </button>
          </div>
        )}

        {errors.addressId && <p style={errorStyle}>{errors.addressId}</p>}
      </div>

      {/* Shipping Method */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Truck size={16} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            Metode Pengiriman
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shippingOptions.map((opt) => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '10px',
              border: `2px solid ${shippingMethod === opt.value ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.08)'}`,
              background: shippingMethod === opt.value ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="radio" name="shipping" value={opt.value}
                  checked={shippingMethod === opt.value}
                  onChange={() => setShippingMethod(opt.value)}
                  style={{ accentColor: '#f59e0b' }} />
                <span style={{ fontSize: '14px', color: '#fff' }}>{opt.label}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>
                Rp {opt.cost.toLocaleString('id-ID')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CreditCard size={16} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            Metode Pembayaran
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {paymentOptions.map((opt) => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px', borderRadius: '10px',
              border: `2px solid ${paymentMethod === opt.value ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.08)'}`,
              background: paymentMethod === opt.value ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <input type="radio" name="payment" value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => setPaymentMethod(opt.value)}
                style={{ accentColor: '#f59e0b' }} />
              <span style={{ fontSize: '14px', color: '#fff' }}>{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && <p style={errorStyle}>{errors.paymentMethod}</p>}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={16} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            Catatan (opsional)
          </h3>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan untuk pesanan..." rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
      </div>

      {/* Submit */}
      <button type="submit" disabled={submitting || addresses.length === 0}
        style={{
          width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
          background: (submitting || addresses.length === 0) ? 'rgba(255,176,0,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: (submitting || addresses.length === 0) ? 'rgba(0,0,0,0.4)' : '#000',
          fontSize: '16px', fontWeight: 800,
          cursor: (submitting || addresses.length === 0) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.2s',
          boxShadow: (submitting || addresses.length === 0) ? 'none' : '0 4px 20px rgba(245,158,11,0.25)',
        }}>
        {submitting ? (
          <><Loader2 size={18} className="animate-spin" /> Memproses...</>
        ) : (
          `Buat Pesanan — Rp ${total.toLocaleString('id-ID')}`
        )}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '5px' }}>{label}</label>
      <input type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: '#fff',
          fontSize: '13px', outline: 'none', boxSizing: 'border-box',
        }} />
    </div>
  );
}

export default CheckoutForm;
