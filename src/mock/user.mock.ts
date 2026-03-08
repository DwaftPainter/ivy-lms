import { User } from "@/models/user.model";

export const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    password: "hashed-password",
    firstName: "Cong",
    lastName: "Nghiem Thanh",
    phone: "0912909455",
    avatar: "https://i.pinimg.com/474x/5a/d0/13/5ad013e61069c4f2c72ad5505f707936.jpg",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
};

export const mockUsers: User[] = [
    mockUser,
    {
        id: "user-1",
        email: "test@example.com",
        password: "hashed-password",
        firstName: "Cong",
        lastName: "Nghiem Thanh",
        phone: "0912909455",
        avatar: "https://i.pinimg.com/474x/5a/d0/13/5ad013e61069c4f2c72ad5505f707936.jpg",
        createdAt: new Date("2024-01-02T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z")
    }
];
