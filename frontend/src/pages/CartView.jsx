import { useState } from "react";
import dummyCart from "../data/dummyCart";
import CartItem from "../components/CartItem";
import EmptyCart from "../components/EmptyCart";
import OrderSummary from "../components/OrderSummary";

/**
 * CartView.jsx
 * ------------
 * Halaman utama Cart / Keranjang Belanja Siber Merch.
 *
 * State:
 *  - cartItems : array item di keranjang, diinisialisasi dari dummyCart
 *
 * Handler:
 *  - handleIncrease : tambah quantity +1
 *  - handleDecrease : kurangi quantity -1 (minimum 1)
 *  - handleRemove   : hapus item dari keranjang
 */
function CartView() {
  // useState menyimpan daftar item keranjang
  // Initial value diambil dari data dummy
  const [cartItems, setCartItems] = useState(dummyCart);

  // ── Tambah quantity +1 ──
  const handleIncrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // ── Kurangi quantity -1, minimum 1 ──
  const handleDecrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  // ── Hapus item dari keranjang ──
  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Header / Navbar ── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Siber Merch</span>
          </div>

          {/* Badge jumlah item */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span>{cartItems.length} produk</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Judul Halaman */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Keranjang Belanja</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {cartItems.length > 0
              ? `${cartItems.length} produk dalam keranjang`
              : "Keranjang kamu masih kosong"}
          </p>
        </div>

        {/* ── Layout 2 Kolom (desktop) / 1 Kolom (mobile) ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Kolom Kiri: Daftar Item ── */}
          <div className="flex-1">
            {cartItems.length === 0 ? (
              // Tampilkan empty state jika keranjang kosong
              <EmptyCart />
            ) : (
              // Tampilkan daftar item
              <div className="space-y-3">
                {/* Header kolom (hanya tampil di desktop) */}
                <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 pb-2 text-xs text-zinc-600 uppercase tracking-wider">
                  <span>Produk</span>
                  <span className="text-center w-28">Quantity</span>
                  <span className="text-right w-24">Subtotal</span>
                  <span className="w-8" />
                </div>

                {/* Render setiap CartItem */}
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Kolom Kanan: Order Summary ── */}
          <div className="w-full lg:w-80 xl:w-96">
            <OrderSummary cartItems={cartItems} />
          </div>

        </div>
      </main>

    </div>
  );
}

export default CartView;
