import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
import { userService } from "@/services/api";
import { toast } from "sonner";

const loginFormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await userService.userLogin({
                email: values.email,
                password: values.password,
            });

            // Store the token in localStorage
            localStorage.setItem("token", response.data.token);
            
            // Store user data with roles
            const userData = {
                ...response.data.user,
                roles: response.data.user.roles // Make sure roles array is included
            };
            localStorage.setItem("user", JSON.stringify(userData));
            
            // Show success message
            toast("User login successfully!", {
                description: "welcome back!",
            });

            // Redirect based on user role
            const userRole = response.data.user.roles[0].toLowerCase();
            console.log("User role after login:", userRole); // Debug log
            
            if (userRole === 'admin') {
                navigate("/admin/dashboard");
            } else if (userRole === 'landlord') {
                navigate("/property");
            } else {
                navigate("/");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Login failed";
            toast(errorMessage, {
                description: "Please check your credentials and try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full">
            <div className="w-[73%]">
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
                                                    type="email"
                                                    autoComplete="email"
                                                    {...field}
                                                    disabled={isLoading}
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
                                                    autoComplete="current-password"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button 
                                    type="submit" 
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 w-[27%]">
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