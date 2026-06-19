import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import cartService from "../services/cartService";
import { storageUrl } from "../services/config";
import CartItem from "../components/CartItem";
import EmptyCart from "../components/EmptyCart";
import OrderSummary from "../components/OrderSummary";

function CartView() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapCartItem = (item) => ({
    id: item.id,
    name: item.product?.name || "Produk tidak ditemukan",
    size: item.variant?.name || "Default",
    price: item.product?.price || 0,
    quantity: item.quantity,
    stock: item.variant?.stock ?? item.product?.stock ?? 0,
    image: item.product?.images?.[0]?.url
      ? storageUrl(item.product.images[0].url)
      : "https://placehold.co/64x64/27272a/71717a?text=IMG",
    cartItemId: item.id,
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartService.getCart();
      const items = res.data || [];
      setCartItems(items.map(mapCartItem));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Gagal memuat keranjang. Silakan coba lagi.";
      setError(message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleIncrease = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity >= item.stock) {
      toast.error(`Stok ${item.name} hanya tersisa ${item.stock}`);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
    try {
      await cartService.updateCartItem(item.cartItemId, item.quantity + 1);
    } catch {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: item.quantity } : i))
      );
      toast.error("Gagal memperbarui kuantitas");
    }
  };

  const handleDecrease = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item || item.quantity <= 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
    );
    try {
      await cartService.updateCartItem(item.cartItemId, item.quantity - 1);
    } catch {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: item.quantity } : i))
      );
      toast.error("Gagal memperbarui kuantitas");
    }
  };

  const handleRemove = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await cartService.removeCartItem(item.cartItemId);
      toast.success("Item dihapus dari keranjang");
    } catch {
      setCartItems((prev) => [...prev, item]);
      toast.error("Gagal menghapus item");
    }
  };

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#08090c", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <div className="h-7 w-44 bg-zinc-800 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-28 bg-zinc-800/50 rounded animate-pulse" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="lg:flex-row">
            <div style={{ flex: 1 }} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-zinc-800/50 rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="w-full lg:w-[440px]">
              <div className="bg-[#101010] rounded-[24px] border border-[rgba(255,176,0,.15)] p-[45px_38px] space-y-3">
                <div className="h-5 w-36 bg-zinc-800 rounded animate-pulse mx-auto" />
                <div className="h-3 w-full bg-zinc-800/50 rounded animate-pulse" />
                <div className="h-3 w-full bg-zinc-800/50 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-zinc-800/50 rounded animate-pulse" />
                <div className="border-t border-zinc-800" />
                <div className="h-10 w-full bg-zinc-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#08090c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="flex flex-col items-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 ring-1 ring-red-500/20">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-1">Gagal Memuat Keranjang</h2>
          <p className="text-zinc-500 text-sm max-w-xs mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg font-medium text-sm hover:bg-zinc-700 transition-all"
            >
              Kembali Belanja
            </button>
            <button
              onClick={fetchCart}
              className="px-5 py-2.5 bg-amber-500 text-black rounded-lg font-semibold text-sm hover:bg-amber-400 transition-all flex items-center gap-2"
            >
              <Loader2 size={14} />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08090c", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Page Title */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
            Keranjang Belanja
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>
            {cartItems.length > 0
              ? `${cartItems.length} produk dalam keranjang`
              : "Keranjang kamu masih kosong"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ gap: "24px" }}>

          {/* Cart Items */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {cartItems.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                {/* Desktop column headers */}
                <div className="hidden md:grid grid-cols-[64px_1fr_120px_96px_32px] gap-4 px-5 py-2 text-[11px] text-zinc-600 uppercase tracking-wider">
                  <span />
                  <span>Produk</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Subtotal</span>
                  <span />
                </div>

                <div className="flex flex-col gap-4">
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
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <OrderSummary cartItems={cartItems} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartView;
