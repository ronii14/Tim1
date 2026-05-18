/**
 * EmptyCart.jsx
 * -------------
 * Komponen yang ditampilkan ketika keranjang belanja kosong.
 * Menampilkan ikon ilustrasi dan pesan informatif.
 */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Ikon keranjang kosong */}
      <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">
        Keranjang Kosong
      </h3>
      <p className="text-zinc-500 text-sm max-w-xs">
        Belum ada produk yang ditambahkan ke keranjang. Silakan pilih produk terlebih dahulu.
      </p>
    </div>
  );
}

export default EmptyCart;
