"use client"; // Mark the component as a Client Component (if using Next.js)

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the form schema
const loginFormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

// Infer the type of the form values
type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        // Handle form submission
        console.log("Form values:", values);
    };

    return (
        <div className="flex ml-[500px]">
            {" "}
            {/* Add space between the form and image */}
            {/* Login Form */}
            <div className="flex justify-center items-center h-screen bg-gray-100 flex-1">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Login
                    </h1>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>

            <div className=" w-[300px] "></div>
            {/* Image on the Right */}
            <div className="flex-shrink-0">
                <img
                    src="/image/1.jpg"
                    alt="Logo"
                    className="h-screen w-auto object-cover"
                />
            </div>
        </div>
    );
};

export default LoginPage;
