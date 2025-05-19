import * as z from "zod";

// General user schema for all user operations
export const userSchema = z.object({
    firstName: z
        .string({ required_error: "First name is required" })
        .min(2, { message: "First name must be at least 2 characters long" })
        .max(150, { message: "First name cannot exceed 150 characters" }),
    lastName: z
        .string({ required_error: "Last name is required" })
        .min(2, { message: "Last name must be at least 2 characters long" })
        .max(150, { message: "Last name cannot exceed 150 characters" }),
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Please provide a valid email address" })
        .trim()
        .toLowerCase(),
    phone: z
        .string()
        .optional()
        .nullable()
        .refine((value) => !value || /^\d{10,15}$/.test(value), {
            message: "Phone number must contain only digits (10-15 characters)",
        }),
    jobProfiles: z.array(z.any()).optional(),
    role: z.enum(["USER", "ADMIN", "SELLER"]).default("USER"),
    avatar: z.string().optional().nullable(),
    otp: z.number().optional().nullable(),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" }),
    refreshToken: z.string().optional().nullable(),
});

// Update user schema by making all fields optional except email and password
export const updateUserSchema = userSchema
    .omit({ email: true, password: true })
    .partial();

// User Interface
export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobProfiles: Array<any>;
    role: string;
    avatar: string;
    otp: number;
    refreshToken: string;
}
