import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "../utils/formatCurrency";

function OrderSummary({ cartItems }) {
  const navigate = useNavigate();
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const isEmpty = cartItems.length === 0;

  return (
    <div
      style={{
        width: "100%",
        background: "#101010",
        border: "1px solid rgba(255,176,0,.15)",
        borderRadius: "20px",
        padding: "32px 28px",
        boxShadow: "0 0 30px rgba(255,176,0,.06), 0 20px 60px rgba(0,0,0,.5)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: "24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, color: "#fff", fontSize: "1.35rem", fontWeight: 800 }}>
          RINGKASAN <span style={{ color: "#ffb000" }}>PESANAN</span>
        </h2>
        <div style={{
          width: "40px",
          height: "3px",
          background: "#ffb000",
          margin: "10px auto 0",
          borderRadius: "999px",
        }} />
      </div>

      {/* Daftar item */}
      <div style={{ marginBottom: "20px", maxHeight: "260px", overflowY: "auto" }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
              <p style={{ margin: 0, color: "rgba(255,255,255,.85)", fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </p>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.4)", fontSize: "12px" }}>
                {item.quantity} × {formatRupiah(item.price)}
              </p>
            </div>
            <span style={{ color: "rgba(255,255,255,.85)", fontWeight: 600, fontSize: "14px", flexShrink: 0 }}>
              {formatRupiah(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {isEmpty && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,.4)" }}>
            <ShoppingCart size={28} style={{ marginBottom: "8px", color: "rgba(255,255,255,.2)" }} />
            <p style={{ margin: 0, fontSize: "13px" }}>Tidak ada item</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ color: "rgba(255,255,255,.5)", fontSize: "13px" }}>Total Item</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{totalQty} pcs</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,.6)", fontSize: "13px", fontWeight: 500 }}>Total Pembayaran</span>
          <span style={{ color: "#ffb000", fontWeight: 800, fontSize: "18px" }}>
            {formatRupiah(grandTotal)}
          </span>
        </div>
      </div>

      {/* Button */}
      <button
        disabled={isEmpty}
        onClick={() => navigate('/checkout', { state: { cartItems } })}
        style={{
          width: "100%",
          height: "46px",
          border: "none",
          borderRadius: "10px",
          background: isEmpty ? "rgba(255,255,255,.08)" : "#ffb000",
          color: isEmpty ? "rgba(255,255,255,.4)" : "#000",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: ".85rem",
          letterSpacing: ".08em",
          cursor: isEmpty ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "18px",
          transition: ".25s",
          boxShadow: isEmpty ? "none" : "0 0 20px rgba(255,176,0,.15)",
        }}
        onMouseEnter={(e) => {
          if (!isEmpty) {
            e.currentTarget.style.background = "#ffc933";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isEmpty) {
            e.currentTarget.style.background = "#ffb000";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        <ShoppingCart size={18} />
        {isEmpty ? "KERANJANG KOSONG" : "PROSES PEMBAYARAN"}
      </button>

      {!isEmpty && (
        <p style={{ textAlign: "center", marginTop: "16px", color: "rgba(255,255,255,.35)", fontSize: "12px" }}>
          * Harga sudah termasuk semua item
        </p>
      )}

    </div>
  );
}

export default OrderSummary;
