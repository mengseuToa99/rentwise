import React, { useState } from "react";
import RootLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Users } from "lucide-react";
import { z } from "zod";
import ReusableForm from "@/components/AddUserForm";
import MultipleUserForm from "@/components/MultipleUserForm";
import UsersTable from "@/components/data-table/users-table";
import { toast } from "sonner";
import { userService } from '@/services/api';

// Your schema remains the same
const userFormSchema = z.object({
    username: z.string().min(1, { message: "Username is required." }),
    password_hash: z.string().min(6, { message: "Password must be at least 6 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone_number: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    first_name: z.string().min(1, { message: "First name is required." }),
    last_name: z.string().min(1, { message: "Last name is required." }),
    role: z.enum(["admin", "landlord", "tenant"], { message: "Role is required." }),
    propertyAddress: z.string().optional().nullable(),
    profile_picture: z.string().optional().nullable(),
    id_card_picture: z.string().optional().nullable()
});

const AccountPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState("tenant");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formType, setFormType] = useState<'single' | 'multiple' | null>(null);

    const onSubmit = async (values: any) => {
        const submitData = {
            ...values,
            profile_picture: null,
            id_card_picture: null,
            propertyAddress: values.propertyAddress || null
        };

        try {
            await userService.createSingleUser(submitData);
            toast("User has been created successfully!", {
                description: "The new user has been added to the system.",
            });
            setIsDialogOpen(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create user.";
            toast(errorMessage, {
                description: "Please check the form and try again.",
                variant: "destructive",
            });
        }
    };

    const onSubmitMultiple = async (users: any[]) => {
        try {
            await userService.createMultipleUsers(users);
            toast("Users have been created successfully!", {
                description: `${users.length} users have been added to the system.`,
            });
            setIsDialogOpen(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create users.";
            toast(errorMessage, {
                description: "Please check the form and try again.",
                variant: "destructive",
            });
        }
    };
    
    const formFields = [
        { name: "username", label: "Username", type: "text", placeholder: "Enter username" },
        { name: "password_hash", label: "Password", type: "password", placeholder: "Enter password" },
        { name: "email", label: "Email", type: "email", placeholder: "Enter email" },
        { name: "phone_number", label: "Phone", type: "text", placeholder: "Enter phone number" },
        { name: "first_name", label: "First Name", type: "text", placeholder: "Enter first name" },
        { name: "last_name", label: "Last Name", type: "text", placeholder: "Enter last name" },
        { name: "role", label: "Role", type: "select", options: ["admin", "landlord", "tenant"], onChange: setSelectedRole },
    ];
    
    if (selectedRole === "landlord") {
        formFields.push({ name: "propertyAddress", label: "Property Address", type: "text", placeholder: "Enter property address" });
    }

    return (
        <RootLayout>
            <div className="flex justify-center mt-10">
                <Dialog 
                    open={isDialogOpen} 
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setFormType(null);
                            setIsDropdownOpen(false);
                        }
                    }}
                >
                    <DropdownMenu 
                        open={isDropdownOpen}
                        onOpenChange={setIsDropdownOpen}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Plus size={16} />
                                Add User
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem 
                                onClick={() => {
                                    setFormType('single');
                                    setIsDialogOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Single User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => {
                                    setFormType('multiple');
                                    setIsDialogOpen(true);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Add Multiple Users
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent className="max-h-[80vh] overflow-y-auto max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                {formType === 'single' ? 'Create New User' : 'Create Multiple Users'}
                            </DialogTitle>
                            <DialogDescription>
                                {formType === 'single' 
                                    ? 'Select the role and enter user details.' 
                                    : 'Add multiple users at once. Each row represents one user.'}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {formType === 'single' ? (
                            <ReusableForm
                                formSchema={userFormSchema}
                                defaultValues={{
                                    username: "",
                                    password_hash: "",
                                    email: "",
                                    phone_number: "",
                                    first_name: "",
                                    last_name: "",
                                    role: "tenant",
                                    propertyAddress: "",
                                    profile_picture: null,
                                    id_card_picture: null
                                }}
                                onSubmit={onSubmit}
                                fields={formFields}
                                successMessage="User has been added successfully!"
                            />
                        ) : (
                            <MultipleUserForm
                                fields={formFields}
                                onSubmit={onSubmitMultiple}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                <UsersTable />
            </div>
        </RootLayout>
    );
};

export default AccountPage;