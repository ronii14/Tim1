import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

/**
 * EmptyCart.jsx
 * -------------
 * Komponen yang ditampilkan ketika keranjang belanja kosong.
 * Menampilkan ikon ilustrasi, pesan, dan tombol ke halaman produk.
 */
function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Ikon keranjang kosong */}
      <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 ring-1 ring-zinc-700/50">
        <ShoppingBag size={48} className="text-zinc-600" />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">
        Keranjang Kosong
      </h3>
      <p className="text-zinc-500 text-sm max-w-xs mb-8">
        Belum ada produk yang ditambahkan ke keranjang. 
        Silakan pilih produk terlebih dahulu.
      </p>

      <button
        onClick={() => navigate('/products')}
        className="px-6 py-3 bg-amber-500 text-black rounded-xl font-bold text-sm 
                   hover:bg-amber-400 active:scale-[0.97] transition-all
                   flex items-center gap-2"
      >
        <ShoppingBag size={16} />
        Lihat Produk
      </button>
    </div>
  );
}

export default EmptyCart;
