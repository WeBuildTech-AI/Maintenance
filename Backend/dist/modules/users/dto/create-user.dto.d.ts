declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    TECHNICIAN = "technician",
    VIEWER = "viewer"
}
export declare class CreateUserDto {
    organizationId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    password?: string;
}
export { UserRole };
