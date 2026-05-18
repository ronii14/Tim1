import { formatRupiah } from "../utils/formatCurrency";


/**
 * CartItem.jsx
 * ------------
 * Komponen untuk menampilkan SATU baris item di keranjang.
 *
 * Props yang diterima:
 *  - item       : objek data produk (id, name, size, price, quantity, image)
 *  - onIncrease : fungsi dipanggil saat tombol "+" ditekan
 *  - onDecrease : fungsi dipanggil saat tombol "-" ditekan
 *  - onRemove   : fungsi dipanggil saat tombol hapus ditekan
 */
function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  // Subtotal = harga satuan × quantity
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-zinc-600 transition-colors">

      {/* ── Gambar Produk ── */}
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-xl object-cover bg-zinc-800"
          onError={(e) => {
            // Fallback jika gambar gagal dimuat
            e.target.src = "https://placehold.co/80x80/27272a/71717a?text=IMG";
          }}
        />
      </div>

      {/* ── Info Produk ── */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm leading-tight truncate">
          {item.name}
        </h3>
        <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-md">
          Size: {item.size}
        </span>
        <p className="mt-1 text-zinc-400 text-xs">
          {formatRupiah(item.price)} / pcs
        </p>
      </div>

      {/* ── Quantity Control ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Tombol Kurang */}
        <button
          onClick={() => onDecrease(item.id)}
          aria-label={`Kurangi quantity ${item.name}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-40"
          disabled={item.quantity <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        {/* Angka Quantity */}
        <span className="w-8 text-center text-white font-bold text-sm">
          {item.quantity}
        </span>

        {/* Tombol Tambah */}
        <button
          onClick={() => onIncrease(item.id)}
          aria-label={`Tambah quantity ${item.name}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* ── Subtotal ── */}
      <div className="text-right flex-shrink-0 min-w-[90px]">
        <p className="text-white font-bold text-sm">{formatRupiah(subtotal)}</p>
      </div>

      {/* ── Tombol Hapus ── */}
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Hapus ${item.name} dari keranjang`}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

    </div>
  );
}

export default CartItem;
