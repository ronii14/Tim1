import { Minus, Plus, Trash2, Package } from "lucide-react";
import { formatRupiah } from "../utils/formatCurrency";

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const subtotal = item.price * item.quantity;
  const isMaxStock = item.quantity >= item.stock;
  const stockInfo = item.stock > 0
    ? `Sisa stok: ${item.stock}`
    : "Stok habis";

  return (
    <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden">

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4 px-5 py-5">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover bg-zinc-800"
            onError={(e) => {
              e.target.src = "https://placehold.co/64x64/27272a/71717a?text=IMG";
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-zinc-500 text-xs">{formatRupiah(item.price)}</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400 text-xs">Ukuran: {item.size}</span>
          </div>
          {/* Stock info */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Package size={11} className="text-zinc-600" />
            <span className={`text-[11px] ${isMaxStock ? 'text-amber-400' : 'text-zinc-500'}`}>
              {stockInfo}
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDecrease(item.id)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-md
                       bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white
                       disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          <span className="w-8 text-center text-white font-semibold text-sm select-none tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrease(item.id)}
            disabled={isMaxStock}
            className="w-7 h-7 flex items-center justify-center rounded-md
                       bg-amber-500 text-black hover:bg-amber-400 transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right w-24">
          <p className="text-white font-semibold text-sm tabular-nums">
            {formatRupiah(subtotal)}
          </p>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                     text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4">
        <div className="flex gap-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
            onError={(e) => {
              e.target.src = "https://placehold.co/64x64/27272a/71717a?text=IMG";
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
            <span className="text-zinc-400 text-xs">Ukuran: {item.size}</span>
            <p className="text-zinc-500 text-xs mt-0.5">{formatRupiah(item.price)} / pcs</p>
            {/* Stock info mobile */}
            <div className="flex items-center gap-1.5 mt-1">
              <Package size={10} className="text-zinc-600" />
              <span className={`text-[10px] ${isMaxStock ? 'text-amber-400' : 'text-zinc-500'}`}>
                {stockInfo}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                       text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrease(item.id)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-md
                         bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>
            <span className="w-8 text-center text-white font-semibold text-sm select-none tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onIncrease(item.id)}
              disabled={isMaxStock}
              className="w-7 h-7 flex items-center justify-center rounded-md
                         bg-amber-500 text-black hover:bg-amber-400 transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-white font-semibold text-sm tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>
      </div>

    </div>
  );
}

export default CartItem;
