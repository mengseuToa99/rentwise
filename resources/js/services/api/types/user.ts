// resources/js/services/api/types/user.ts
export interface User {
    user_id: number;
    username: string;
    email: string;
    phone_number: string | null;
    status: string;
    first_name: string;
    last_name: string;
    created_at: string;
    roles: Array<{
        role_id: number;
        role_name: string;
    }>;
}