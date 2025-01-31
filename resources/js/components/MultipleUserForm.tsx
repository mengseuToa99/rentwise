import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

interface MultipleUserFormProps {
    fields: Array<{
        name: string;
        label: string;
        type: string;
        placeholder?: string;
        options?: string[];
    }>;
    onSubmit: (users: any[]) => void;
}

const MultipleUserForm: React.FC<MultipleUserFormProps> = ({ fields, onSubmit }) => {
    const [users, setUsers] = useState([createEmptyUser()]);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    function createEmptyUser() {
        const user: any = {};
        fields.forEach(field => {
            user[field.name] = '';
        });
        return user;
    }

    const handleAddUser = () => {
        setUsers([...users, createEmptyUser()]);
    };

    const handleRemoveUser = (index: number) => {
        const newUsers = users.filter((_, i) => i !== index);
        setUsers(newUsers);
        setExpandedRows(expandedRows.filter(i => i !== index));
    };

    const handleUserChange = (index: number, fieldName: string, value: string) => {
        const newUsers = [...users];
        newUsers[index] = {
            ...newUsers[index],
            [fieldName]: value
        };
        setUsers(newUsers);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(users);
    };

    const toggleRow = (index: number) => {
        setExpandedRows(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    // Desktop view (table)
    const DesktopView = () => (
        <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            {fields.map(field => (
                                <TableHead key={field.name}>{field.label}</TableHead>
                            ))}
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                {fields.map(field => (
                                    <TableCell key={field.name}>
                                        {field.type === 'select' ? (
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={user[field.name]}
                                                onChange={(e) => handleUserChange(index, field.name, e.target.value)}
                                            >
                                                <option value="">Select {field.label}</option>
                                                {field.options?.map(option => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={user[field.name]}
                                                onChange={(e) => handleUserChange(index, field.name, e.target.value)}
                                                className="w-full"
                                            />
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    {users.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveUser(index)}
                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    // Mobile view (cards)
    const MobileView = () => (
        <div className="space-y-4">
            {users.map((user, index) => (
                <Card key={index} className="relative">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">User {index + 1}</CardTitle>
                            <div className="flex gap-2">
                                {users.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveUser(index)}
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleRow(index)}
                                    className="h-8 w-8"
                                >
                                    {expandedRows.includes(index) ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={expandedRows.includes(index) ? "" : "hidden sm:block"}>
                        <div className="grid gap-4">
                            {fields.map(field => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-sm font-medium">{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="w-full p-2 border rounded-md"
                                            value={user[field.name]}
                                            onChange={(e) => handleUserChange(index, field.name, e.target.value)}
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options?.map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={user[field.name]}
                                            onChange={(e) => handleUserChange(index, field.name, e.target.value)}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="hidden sm:block">
                <DesktopView />
            </div>
            <div className="sm:hidden">
                <MobileView />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddUser}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Another User
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save All Users
                </Button>
            </div>
        </div>
    );
};

export default MultipleUserForm;