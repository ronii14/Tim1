<?php

namespace App\Http\Controllers\API\Admin\CustomerService;

use App\Http\Controllers\Controller;
use App\Models\CustomerServiceConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminCustomerServiceConversationController extends Controller
{
    /**
     * List semua conversation untuk dashboard admin.
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['sometimes', Rule::in(['open', 'pending', 'resolved', 'closed'])],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
            'search' => 'sometimes|string|max:255',
        ]);

        $conversations = CustomerServiceConversation::with(['customer:id,name,email', 'assignedAdmin:id,name,email'])
            ->when($request->filled('status'), fn($query) => $query->where('status', $request->status))
            ->when($request->filled('priority'), fn($query) => $query->where('priority', $request->priority))
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($subQuery) use ($request) {
                    $subQuery->where('subject', 'like', "%{$request->search}%")
                        ->orWhere('last_message', 'like', "%{$request->search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($request) {
                            $customerQuery->where('name', 'like', "%{$request->search}%")
                                ->orWhere('email', 'like', "%{$request->search}%");
                        });
                });
            })
            ->latest('last_message_at')
            ->latest()
            ->get()
            ->map(fn($conversation) => $this->formatConversation($conversation));

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    /**
     * Detail conversation untuk admin.
     */
    public function show(CustomerServiceConversation $conversation)
    {
        $conversation->messages()
            ->where('sender_role', 'customer')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $conversation->load(['customer:id,name,email', 'assignedAdmin:id,name,email', 'messages.sender:id,name,email']);

        return response()->json(['success' => true, 'data' => $this->formatConversation($conversation, true)]);
    }

    /**
     * Admin membalas pesan customer.
     */
    public function sendMessage(Request $request, CustomerServiceConversation $conversation)
    {
        if ($conversation->status === 'closed') {
            return response()->json([
                'success' => false,
                'message' => 'Conversation sudah ditutup',
            ], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = DB::transaction(function () use ($request, $conversation, $validated) {
            $message = $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'sender_role' => 'admin',
                'message' => $validated['message'],
                'message_type' => 'text',
                'is_read' => false,
            ]);

            $conversation->update([
                'assigned_admin_id' => $conversation->assigned_admin_id ?? $request->user()->id,
                'status' => 'pending',
                'last_message' => $validated['message'],
                'last_message_at' => now(),
            ]);

            return $message;
        });

        return response()->json([
            'success' => true,
            'message' => 'Balasan berhasil dikirim',
            'data' => $this->formatMessage($message->load('sender:id,name,email')),
        ], 201);
    }

    /**
     * Update status conversation.
     */
    public function updateStatus(Request $request, CustomerServiceConversation $conversation)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'pending', 'resolved', 'closed'])],
        ]);

        $conversation->update([
            'status' => $validated['status'],
            'assigned_admin_id' => $conversation->assigned_admin_id ?? $request->user()->id,
            'closed_at' => in_array($validated['status'], ['resolved', 'closed']) ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status conversation berhasil diupdate',
            'data' => $this->formatConversation($conversation->fresh(['customer:id,name,email', 'assignedAdmin:id,name,email'])),
        ]);
    }

    private function formatConversation(CustomerServiceConversation $conversation, bool $includeMessages = false): array
    {
        $data = [
            'id' => $conversation->id,
            'customer' => $conversation->customer ? [
                'id' => $conversation->customer->id,
                'name' => $conversation->customer->name,
                'email' => $conversation->customer->email,
            ] : null,
            'assigned_admin' => $conversation->assignedAdmin ? [
                'id' => $conversation->assignedAdmin->id,
                'name' => $conversation->assignedAdmin->name,
                'email' => $conversation->assignedAdmin->email,
            ] : null,
            'subject' => $conversation->subject,
            'status' => $conversation->status,
            'source' => $conversation->source,
            'priority' => $conversation->priority,
            'last_message' => $conversation->last_message,
            'last_message_at' => $conversation->last_message_at,
            'closed_at' => $conversation->closed_at,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ];

        if ($includeMessages) {
            $data['messages'] = $conversation->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn($message) => $this->formatMessage($message));
        }

        return $data;
    }

    private function formatMessage($message): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'email' => $message->sender->email,
            ] : null,
            'sender_role' => $message->sender_role,
            'message' => $message->message,
            'message_type' => $message->message_type,
            'is_read' => $message->is_read,
            'read_at' => $message->read_at,
            'created_at' => $message->created_at,
        ];
    }
}
