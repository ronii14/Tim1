<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * List all orders in the system (with optional filtering).
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'payment', 'address', 'promo'])
            ->withCount('items');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $orders,
        ]);
    }

    /**
     * Update order status & tracking number.
     */
    public function updateStatus(Request $request, string $id)
    {
        $order = Order::with(['items', 'payment'])->findOrFail($id);

        $validated = $request->validate([
            'status'          => 'required|string|in:pending,paid,processing,shipped,delivered,cancelled,refunded',
            'tracking_number' => 'required_if:status,shipped|nullable|string|max:100',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        if ($oldStatus === $newStatus) {
            return response()->json([
                'success' => true,
                'data'    => $order,
                'message' => 'Status pesanan tidak berubah.',
            ]);
        }

        DB::transaction(function () use ($order, $oldStatus, $newStatus, $validated) {
            $updateData = ['status' => $newStatus];

            if ($newStatus === 'shipped') {
                $updateData['tracking_number'] = $validated['tracking_number'];
            }

            $order->update($updateData);

            // If updating to cancelled or refunded, and stock wasn't previously restored
            if (in_value($newStatus, ['cancelled', 'refunded']) && !in_value($oldStatus, ['cancelled', 'refunded'])) {
                // Restore Stock
                foreach ($order->items as $item) {
                    if ($item->variant_id) {
                        ProductVariant::where('id', $item->variant_id)->increment('stock', $item->quantity);
                    } else {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }

                // Update payment status
                if ($order->payment) {
                    $paymentStatus = $newStatus === 'refunded' ? 'refunded' : 'failed';
                    $order->payment->update(['status' => $paymentStatus]);
                }
            }
        });

        $order->load(['payment']);

        return response()->json([
            'success' => true,
            'data'    => $order,
            'message' => "Status pesanan berhasil diperbarui menjadi {$newStatus}.",
        ]);
    }
}

// Helper function to check if a value is in an array (avoid using PHP in_array directly if strict flag is wanted, helper keeps clean)
if (!function_exists('in_value')) {
    function in_value($val, $arr) {
        return in_array($val, $arr, true);
    }
}
