"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Badge } from "@/components/data-table/badge";
import { userService } from "@/services/api/users";
import type { User } from "@/services/api/types/user";
import { toast } from "sonner";

// /resources/js/components/data-table/users-table.tsx
// "use client";

// import { useState, useEffect } from "react";
// import type { ColumnDef } from "@tanstack/react-table";
// import { DataTable } from "./data-table";
// import { DataTableColumnHeader } from "./column-header";
// import { Badge } from "@/components/ui/badge";
// import { userService } from "@/services/api";  // Updated import
// import type { User } from "@/types/user";
// import { toast } from "sonner";

export default function UsersTable() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const users = await userService.getUsersWithRoles();
                setData(users);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast("Failed to fetch users", {
                    description: "There was an error loading the users data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "user_id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="ID" />
            ),
        },
        {
            accessorKey: "username",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Username" />
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
        },
        {
            accessorKey: "phone_number",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }) => row.getValue("phone_number") || "N/A",
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge variant={row.getValue("status") === "active" ? "success" : "destructive"}>
                    {row.getValue("status")}
                </Badge>
            ),
        },
        {
            accessorKey: "roles",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Roles" />
            ),
            cell: ({ row }) => {
                const roles = row.getValue("roles") as Array<{role_name: string}>;
                return (
                    <div className="flex gap-1">
                        {roles?.map((role, index) => (
                            <Badge key={index} variant="secondary">
                                {role.role_name}
                            </Badge>
                        )) || "No roles"}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created At" />
            ),
            cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
        },
    ];

    return (
        <div className="container mx-auto py-10">
            <DataTable
                columns={columns}
                data={data}
                searchKey="email"
                isLoading={loading}
            />
        </div>
    );
}