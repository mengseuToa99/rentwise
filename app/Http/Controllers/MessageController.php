<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Communication;
use App\Models\Log;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display the inbox view with a list of users.
     *
     * @return \Inertia\Response
     */
    public function inbox()
    {
        // Get all users except the authenticated user
        $users = UserDetail::all(); // Or your specific query
        return response()->json([
            'status' => 'success',
            'users' => $users
        ]);
    }
    
    /**
     * Store a new message.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $userId)
    {
        try {
            $recipientUser = UserDetail::where('user_id', $userId)->first();
            
            if (!$recipientUser) {
                return response()->json(['error' => 'Recipient user not found'], 404);
            }
            
            $validatedData = $request->validate([
                'message' => 'required|string',
            ]);
            
            $message = new Communication();
            $message->sender_id = Auth::user()->user_id;
            $message->receiver_id = $recipientUser->user_id;
            $message->message = $validatedData['message'];
            $message->save();
            
            // Broadcast the message to both users
            broadcast(new MessageSent($message))->toOthers();
            
            return response()->json($message);
        } catch (\Exception $e) {
            \Log::error('Message sending failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }
    /**
     * Fetch messages between the authenticated user and another user.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($userId)
    {
        // Find the recipient user
        $recipientUser = UserDetail::where('user_id', $userId)->first();
        
        if (!$recipientUser) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        $user1Id = Auth::user()->user_id;
        $user2Id = $recipientUser->user_id;
        
        // Fetch messages between the two users
        $messages = Communication::where(function ($query) use ($user1Id, $user2Id) {
            $query->where('sender_id', $user1Id)
                ->where('receiver_id', $user2Id);
        })
        ->orWhere(function ($query) use ($user1Id, $user2Id) {
            $query->where('sender_id', $user2Id)
                ->where('receiver_id', $user1Id);
        })
        ->orderBy('created_at', 'asc')
        ->get();
        
        // Return the messages as JSON response
        return response()->json($messages);
    }
}