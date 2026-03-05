export type UserRole = "customer" | "admin" | "staff";

export interface AuthTokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}
