import React from "react";
import RootLayout from "@/components/layout";
import { Textarea } from "@/components/ui/textarea"


const Communication: React.FC = () => {
    const users = Array(5)
        .fill()
        .map((_, i) => ({
            id: i + 1,
            username: "Username",
        }));

    return (
        <RootLayout>
            <div className="min-h-screen w-full bg-white">
                <div className="container mx-auto py-8 flex">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold p-6 border-b">
                            Communication
                        </h1>
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center p-4 hover:bg-gray-50 border-b"
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
                                        {user.username}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Textarea />

                </div>
            </div>
        </RootLayout>
    );
};

export default Communication;
