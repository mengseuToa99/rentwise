"use client";

import React, { useState, useRef, useEffect } from "react";
import RootLayout from "@/components/layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { userService } from "../services/api/users";
import type { User } from "../services/api/types/user";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SendIcon, UserIcon, SearchIcon } from "lucide-react"; 
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Define the Message interface since it's missing from the imported types
interface Message {
  message_id: number;
  sender_id: number;
  recipient_id: number;
  message: string;
  created_at: string;
  updated_at: string;
  conversation_id?: number;
}

// Extend Window interface to include Echo
declare global {
  interface Window {
    Echo?: {
      private: (channel: string) => {
        listen: (event: string, callback: () => void) => void;
      };
      leave: (channel: string) => void;
    };
  }
}

// Extended User interface to include the missing properties
interface ExtendedUser extends User {
  profile_image?: string;
  role?: string;
}

interface CommunicationProps {
    authUser?: {
        user_id: number;
    };
}

const Communication: React.FC<CommunicationProps> = ({
    authUser = { user_id: 0 },
}) => {
    const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<ExtendedUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEchoInitialized, setIsEchoInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await userService.getInboxUsers();
                const usersList = Array.isArray(response) ? response : [];
                setUsers(usersList as ExtendedUser[]);
                setFilteredUsers(usersList as ExtendedUser[]);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setError("Failed to load users");
                setUsers([]);
                setFilteredUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter(
            (user) =>
                user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    // Fetch messages for selected user
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

    // Auto-scroll to bottom of chat when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Setup WebSocket for real-time messages
    useEffect(() => {
        if (!authUser?.user_id || !window.Echo || isEchoInitialized) return;

        const webSocketChannel = `message.${authUser.user_id}`;
        
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

    // Get initials for avatar fallback
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Format timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <RootLayout>
            <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
                <div className="container h-full mx-auto py-4 px-4">
                    <h1 className="text-3xl font-bold mb-4">Messages</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
                        {/* Users list */}
                        <Card className="md:col-span-1 h-full flex flex-col">
                            <CardHeader className="pb-3 flex-none">
                                <CardTitle>Contacts</CardTitle>
                                <div className="relative mt-2">
                                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contacts..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <Separator className="flex-none" />
                            <div className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    {isLoading ? (
                                        <div className="p-4 space-y-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="flex items-center space-x-4">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-[150px]" />
                                                        <Skeleton className="h-4 w-[100px]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 text-destructive">{error}</div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="p-4 text-muted-foreground">
                                            {searchQuery ? "No matching contacts found" : "No contacts found"}
                                        </div>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.user_id}
                                                onClick={() => setSelectedUser(user)}
                                                className={`flex items-center p-4 hover:bg-accent transition-colors cursor-pointer ${
                                                    selectedUser?.user_id === user.user_id
                                                        ? "bg-accent"
                                                        : ""
                                                }`}
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} />
                                                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="ml-4">
                                                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.role || user.roles?.[0]?.name || 'User'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </ScrollArea>
                            </div>
                        </Card>

                        {/* Chat area */}
                        <Card className="md:col-span-2 h-full flex flex-col">
                            {selectedUser ? (
                                <>
                                    <CardHeader className="pb-3 flex-none">
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarImage src={selectedUser.profile_image} alt={`${selectedUser.first_name} ${selectedUser.last_name}`} />
                                                <AvatarFallback>{getInitials(selectedUser.first_name, selectedUser.last_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle>{selectedUser.first_name} {selectedUser.last_name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{selectedUser.role || selectedUser.roles?.[0]?.name || 'User'}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <Separator className="flex-none" />
                                    <div className="flex-1 overflow-hidden relative">
                                        <div className="absolute inset-0 overflow-y-auto p-4">
                                            {messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                    No messages yet. Start the conversation!
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {messages.map((message) => (
                                                        <div
                                                            key={message.message_id}
                                                            className={`flex ${
                                                                message.sender_id === authUser.user_id
                                                                    ? "justify-end"
                                                                    : "justify-start"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-md p-3 rounded-lg ${
                                                                    message.sender_id === authUser.user_id
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "bg-accent text-accent-foreground"
                                                                }`}
                                                            >
                                                                <p className="break-words">{message.message}</p>
                                                                <p className="text-xs mt-1 opacity-70 text-right">
                                                                    {formatTime(message.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator className="flex-none" />
                                    <CardFooter className="p-4 flex-none">
                                        <div className="flex w-full space-x-2">
                                            <Textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type a message..."
                                                className="flex-1 resize-none"
                                                rows={2}
                                            />
                                            <Button 
                                                size="icon" 
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                            >
                                                <SendIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
                                    <UserIcon className="h-16 w-16 mb-4 text-muted-foreground/50" />
                                    <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                                    <p className="text-center max-w-sm">
                                        Select a contact from the list to start chatting
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default Communication;