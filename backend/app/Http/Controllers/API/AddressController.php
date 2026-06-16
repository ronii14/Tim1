<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $addresses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'        => 'nullable|string|max:50',
            'recipient'    => 'required|string|max:255',
            'phone'        => 'required|string|max:20',
            'province'     => 'required|string|max:100',
            'city'         => 'required|string|max:100',
            'district'     => 'required|string|max:100',
            'postal_code'  => 'required|string|max:10',
            'full_address' => 'required|string',
            'is_default'   => 'nullable|boolean',
        ]);

        $user = $request->user();
        $isDefault = $validated['is_default'] ?? false;

        // If this is the first address, default to true
        if ($user->addresses()->count() === 0) {
            $isDefault = true;
        }

        if ($isDefault) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create(array_merge($validated, [
            'is_default' => $isDefault,
        ]));

        return response()->json([
            'success' => true,
            'data'    => $address,
            'message' => 'Alamat berhasil ditambahkan.',
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $address,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'label'        => 'nullable|string|max:50',
            'recipient'    => 'sometimes|required|string|max:255',
            'phone'        => 'sometimes|required|string|max:20',
            'province'     => 'sometimes|required|string|max:100',
            'city'         => 'sometimes|required|string|max:100',
            'district'     => 'sometimes|required|string|max:100',
            'postal_code'  => 'sometimes|required|string|max:10',
            'full_address' => 'sometimes|required|string',
            'is_default'   => 'nullable|boolean',
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $address,
            'message' => 'Alamat berhasil diperbarui.',
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $wasDefault = $address->is_default;

        $address->delete();

        if ($wasDefault) {
            $nextDefault = $request->user()->addresses()->latest()->first();
            if ($nextDefault) {
                $nextDefault->update(['is_default' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus.',
        ]);
    }
}
