<?php

namespace App\Http\Controllers\API\CustomerService;

use App\Http\Controllers\Controller;
use App\Models\CustomerServiceConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerServiceConversationController extends Controller
{
    /**
     * List conversation milik customer yang sedang login.
     */
    public function index(Request $request)
    {
        $conversations = CustomerServiceConversation::with([
            'assignedAdmin:id,name,email',
            'messages' => fn($query) => $query->latest()->limit(1),
        ])
            ->where('customer_id', $request->user()->id)
            ->latest('last_message_at')
            ->latest()
            ->get()
            ->map(fn($conversation) => $this->formatConversation($conversation));

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    /**
     * Buat conversation customer service umum.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
        ]);

        $conversation = DB::transaction(function () use ($request, $validated) {
            $conversation = CustomerServiceConversation::create([
                'customer_id' => $request->user()->id,
                'subject' => $validated['subject'] ?? null,
                'status' => 'open',
                'source' => 'general',
                'priority' => $validated['priority'] ?? 'normal',
                'last_message' => $validated['message'],
                'last_message_at' => now(),
            ]);

            $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'sender_role' => 'customer',
                'message' => $validated['message'],
                'message_type' => 'text',
                'is_read' => false,
            ]);

            return $conversation;
        });

        return response()->json([
            'success' => true,
            'message' => 'Conversation customer service berhasil dibuat',
            'data' => $this->formatConversation($conversation->load(['customer:id,name,email', 'assignedAdmin:id,name,email', 'messages.sender:id,name,email'])),
        ], 201);
    }

    /**
     * Detail conversation customer beserta pesan.
     */
    public function show(Request $request, CustomerServiceConversation $conversation)
    {
        if ($conversation->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke conversation ini',
            ], 403);
        }

        $conversation->messages()
            ->where('sender_role', 'admin')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $conversation->load(['customer:id,name,email', 'assignedAdmin:id,name,email', 'messages.sender:id,name,email']);

        return response()->json(['success' => true, 'data' => $this->formatConversation($conversation, true)]);
    }

    /**
     * Customer mengirim pesan lanjutan.
     */
    public function sendMessage(Request $request, CustomerServiceConversation $conversation)
    {
        if ($conversation->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke conversation ini',
            ], 403);
        }

        if (in_array($conversation->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation sudah selesai atau ditutup',
            ], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = DB::transaction(function () use ($request, $conversation, $validated) {
            $message = $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'sender_role' => 'customer',
                'message' => $validated['message'],
                'message_type' => 'text',
                'is_read' => false,
            ]);

            $conversation->update([
                'status' => 'open',
                'last_message' => $validated['message'],
                'last_message_at' => now(),
            ]);

            return $message;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim',
            'data' => $this->formatMessage($message->load('sender:id,name,email')),
        ], 201);
    }

    private function formatConversation(CustomerServiceConversation $conversation, bool $includeMessages = false): array
    {
        $data = [
            'id' => $conversation->id,
            'customer' => $conversation->relationLoaded('customer') && $conversation->customer ? [
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
