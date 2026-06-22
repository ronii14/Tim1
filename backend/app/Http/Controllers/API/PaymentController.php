<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Simulate payment for an order.
     */
    public function simulate(Request $request, string $ref_code)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:success,failed',
        ]);

        $payment = Payment::where('ref_code', $ref_code)
            ->with('order.items')
            ->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran ini sudah diproses sebelumnya.',
            ], 400);
        }

        DB::transaction(function () use ($payment, $validated) {
            if ($validated['status'] === 'success') {
                // Update Payment
                $payment->update([
                    'status'  => 'success',
                    'paid_at' => now(),
                ]);

                // Update Order
                $payment->order->update([
                    'status' => 'paid',
                ]);
            } else {
                // Update Payment
                $payment->update([
                    'status' => 'failed',
                ]);

                // Update Order
                $payment->order->update([
                    'status' => 'cancelled',
                ]);

                // Restore Stock
                foreach ($payment->order->items as $item) {
                    if ($item->variant_id) {
                        ProductVariant::where('id', $item->variant_id)->increment('stock', $item->quantity);
                    } else {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            }
        });

        $payment->load('order');

        return response()->json([
            'success' => true,
            'data'    => $payment,
            'message' => 'Simulasi pembayaran berhasil diproses.',
        ]);
    }
}
