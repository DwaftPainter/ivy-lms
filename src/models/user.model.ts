export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
