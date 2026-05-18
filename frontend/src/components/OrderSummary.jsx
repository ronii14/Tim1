import { formatRupiah } from "../utils/formatCurrency";

/**
 * OrderSummary.jsx
 * ----------------
 * Panel ringkasan pesanan di sisi kanan halaman.
 *
 * Props yang diterima:
 *  - cartItems : array semua item di keranjang
 *
 * Komponen ini menghitung:
 *  - Total quantity (jumlah semua item)
 *  - Grand total (jumlah semua subtotal)
 */
function OrderSummary({ cartItems }) {
  // Hitung total quantity dari semua item
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Hitung grand total dari semua subtotal item
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const isEmpty = cartItems.length === 0;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sticky top-6">

      {/* ── Header ── */}
      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Ringkasan Pesanan
      </h2>

      {/* ── Daftar Ringkasan Item ── */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-sm">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-zinc-300 truncate">{item.name}</p>
              <p className="text-zinc-600 text-xs">
                {item.quantity} × {formatRupiah(item.price)}
              </p>
            </div>
            <span className="text-zinc-300 font-medium flex-shrink-0">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {/* Tampilkan placeholder jika kosong */}
        {isEmpty && (
          <p className="text-zinc-600 text-sm text-center py-4">
            Tidak ada item
          </p>
        )}
      </div>

      {/* ── Garis Pemisah ── */}
      <div className="border-t border-zinc-800 mb-4" />

      {/* ── Total Quantity ── */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-zinc-400 text-sm">Total Item</span>
        <span className="text-white font-semibold text-sm">
          {totalQty} pcs
        </span>
      </div>

      {/* ── Grand Total ── */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-zinc-400 text-sm font-medium">Total Pembayaran</span>
        <span className="text-amber-400 font-bold text-xl">
          {formatRupiah(grandTotal)}
        </span>
      </div>

      {/* ── Tombol Proses Pembayaran ── */}
      <button
        disabled={isEmpty}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all
          bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98]
          disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
        onClick={() => alert("Fitur pembayaran akan segera hadir!")}
      >
        {isEmpty ? "Keranjang Kosong" : "Proses Pembayaran"}
      </button>

      {/* Catatan kecil */}
      {!isEmpty && (
        <p className="text-zinc-600 text-xs text-center mt-3">
          * Harga sudah termasuk semua item di keranjang
        </p>
      )}

    </div>
  );
}

export default OrderSummary;
