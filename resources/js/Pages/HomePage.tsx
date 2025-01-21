import React from "react";
import RootLayout from "@/components/layout";

const HomePage: React.FC = () => {
    return (
        <RootLayout>
            <div className="flex h-screen w-full">
                <div className="w-[73%]">
                    <div className="flex justify-center items-center h-screen bg-gray-100 flex-1">
                        <div className="bg-white p-8 rounded-lg shadow-md w-96">
                            <h1 className="text-2xl font-bold mb-6 text-center">
                                Home
                            </h1>
                            <p className="text-center">Welcome to the home page!</p>
                        </div>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
};

export default HomePage;