import { ShoppingCart } from 'lucide-react';
import { formatRupiah } from '../../utils/formatCurrency';

function OrderSummary({ cartItems, subtotal, shippingCost, discount }) {
  const isEmpty = !cartItems || cartItems.length === 0;
  const total = (subtotal || 0) - (discount || 0) + (shippingCost || 0);

  return (
    <div style={{
      background: '#101010',
      border: '1px solid rgba(255,176,0,.15)',
      borderRadius: '20px',
      padding: '28px 24px',
      position: 'sticky',
      top: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>
          RINGKASAN <span style={{ color: '#ffb000' }}>PESANAN</span>
        </h3>
        <div style={{
          width: '32px', height: '3px',
          background: '#ffb000', margin: '8px auto 0',
          borderRadius: '999px',
        }} />
      </div>

      {/* Item list */}
      <div style={{ marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
        {isEmpty ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>
            <ShoppingCart size={24} style={{ marginBottom: '6px', color: 'rgba(255,255,255,0.2)' }} />
            <p style={{ margin: 0, fontSize: '12px' }}>Tidak ada item</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                <p style={{
                  margin: 0, color: 'rgba(255,255,255,.85)', fontSize: '13px',
                  fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.name}
                </p>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,.4)', fontSize: '11px' }}>
                  {item.quantity} × {formatRupiah(item.price)}
                  {item.size && item.size !== 'Default' ? ` — ${item.size}` : ''}
                </p>
              </div>
              <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>
                {formatRupiah(item.price * item.quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
        <Row label="Subtotal" value={formatRupiah(subtotal || 0)} />
        {discount > 0 && (
          <Row label="Diskon" value={`-${formatRupiah(discount)}`} valueColor="#22c55e" />
        )}
        {shippingCost > 0 && (
          <Row label="Ongkir" value={formatRupiah(shippingCost)} />
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '12px', marginTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '13px', fontWeight: 600 }}>
            Total
          </span>
          <span style={{ color: '#ffb000', fontWeight: 800, fontSize: '18px' }}>
            {formatRupiah(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0',
    }}>
      <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '12px' }}>{label}</span>
      <span style={{ color: valueColor || 'rgba(255,255,255,.7)', fontWeight: 600, fontSize: '12px' }}>
        {value}
      </span>
    </div>
  );
}

export default OrderSummary;
