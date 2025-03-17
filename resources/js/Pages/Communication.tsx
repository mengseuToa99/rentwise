"use client";

import React, { useState, useRef, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { userService } from "../services/api/users";
import type { User, Message } from "../services/api/types/user";

interface CommunicationProps {
    authUser?: {
        user_id: number;
    };
}

const Communication: React.FC<CommunicationProps> = ({
    authUser = { user_id: 0 },
}) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isEchoInitialized, setIsEchoInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Fetch users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await userService.getInboxUsers(); // Updated to use new method
                setUsers(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setError("Failed to load users");
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Rest of the useEffect hooks remain the same...
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            try {
                const response = await userService.userChatRoom(selectedUser.user_id);
                setMessages(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setMessages([]);
            }
        };

        fetchMessages();
    }, [selectedUser]);

    const handleSendMessage = async () => {
        if (!selectedUser || !newMessage.trim()) return;

        try {
            const messageData = {
                message: newMessage,
                conversation_id: 0
            };
            const response = await userService.sendMessage(selectedUser.user_id, messageData);
            setMessages((prev) => [...prev, response]);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!authUser?.user_id || !window.Echo || isEchoInitialized) return;

        const webSocketChannel = `message.${authUser.user_id}`;
        admin
        try {
            window.Echo.private(webSocketChannel).listen("MessageSent", () => {
                if (selectedUser) {
                    const fetchMessages = async () => {
                        try {
                            const response = await userService.userChatRoom(selectedUser.user_id);
                            setMessages(Array.isArray(response) ? response : []);
                        } catch (error) {
                            console.error("Failed to fetch messages:", error);
                        }
                    };
                    fetchMessages();
                }
            });
            setIsEchoInitialized(true);
        } catch (error) {
            console.error("Failed to initialize WebSocket:", error);
        }

        return () => {
            if (window.Echo) {
                window.Echo.leave(webSocketChannel);
            }
        };
    }, [selectedUser, authUser?.user_id, isEchoInitialized]);

    // JSX remains the same...
    return (
        <RootLayout>
            <div className="min-h-screen w-full bg-white">
                <div className="container mx-auto py-8 flex gap-4">
                    <div className="w-1/4 max-w-md bg-white rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold p-6 border-b">
                            Chats
                        </h1>
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-gray-500">Loading users...</div>
                            ) : error ? (
                                <div className="p-4 text-red-500">{error}</div>
                            ) : users.length === 0 ? (
                                <div className="p-4 text-gray-500">No users found</div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.user_id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`flex items-center p-4 hover:bg-gray-50 border-b cursor-pointer ${
                                            selectedUser?.user_id === user.user_id
                                                ? "bg-gray-100"
                                                : ""
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="ml-4 text-gray-700">
                                            {user.first_name} {user.last_name}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
                        {selectedUser ? (
                            <>
                                <div className="p-4 border-b">
                                    <h2 className="text-xl font-semibold">
                                        Chat with {selectedUser.first_name}{" "}
                                        {selectedUser.last_name}
                                    </h2>
                                </div>
                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-4"
                                    ref={chatContainerRef}
                                >
                                    {messages.map((message) => (
                                        <div
                                            key={message.message_id}
                                            className={`flex ${
                                                message.sender_id ===
                                                authUser.user_id
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs p-3 rounded-lg ${
                                                    message.sender_id ===
                                                    authUser.user_id
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-100"
                                                }`}
                                            >
                                                <p>{message.message}</p>
                                                <p className="text-xs mt-1 opacity-70">
                                                    {new Date(
                                                        message.created_at
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t">
                                    <Textarea
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        onKeyDown={handleKeyPress}
                                        placeholder="Type a message..."
                                        rows={2}
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <Button onClick={handleSendMessage}>
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Select a user to start chatting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default Communication;