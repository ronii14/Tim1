<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * List cart items for authenticated user.
     */
    public function index(Request $request)
    {
        $items = CartItem::where('user_id', $request->user()->id)
            ->with(['product.images', 'variant'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * Add item to cart. If same user+product+variant exists, increment quantity.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity'   => 'required|integer|min:1|max:9999',
        ]);

        $item = CartItem::firstOrNew([
            'user_id'    => $request->user()->id,
            'product_id' => $validated['product_id'],
            'variant_id' => $validated['variant_id'] ?? null,
        ]);

        $item->quantity += $validated['quantity'];
        $item->save();

        $item->load(['product.images', 'variant']);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Item ditambahkan ke keranjang.',
        ], 201);
    }

    /**
     * Update quantity for a cart item.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:9999',
        ]);

        $item = CartItem::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $item->update(['quantity' => $validated['quantity']]);
        $item->load(['product.images', 'variant']);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Kuantitas diperbarui.',
        ]);
    }

    /**
     * Remove single cart item.
     */
    public function destroy(string $id)
    {
        $item = CartItem::where('user_id', auth()->id())
            ->findOrFail($id);

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item dihapus dari keranjang.',
        ]);
    }

    /**
     * Clear all cart items for authenticated user.
     */
    public function clear(Request $request)
    {
        $request->user()->cartItems()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Keranjang dikosongkan.',
        ]);
    }
}
