import { z } from "zod";

// Regex patterns for phone number validation Bangladesh only
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

// Schema for validating signup data in auth services
export const signupDataSchema = z.object({
    firstName: z
        .string({ required_error: "First name is required." })
        .nonempty({ message: "First name is required." })
        .min(2, { message: "First name must be at least 2 characters long." }),
    lastName: z
        .string({ required_error: "Last name is required." })
        .nonempty({ message: "Last name is required." })
        .min(2, { message: "Last name must be at least 2 characters long." }),
    email: z
        .string({ required_error: "Email is required." })
        .nonempty({ message: "Email is required." })
        .email({ message: "Please provide a valid email address." }),
    password: z
        .string({ required_error: "Password is required." })
        .nonempty({ message: "Password is required." })
        .min(8, { message: "Password must be at least 8 characters long." })
        .max(64, { message: "Password must not exceed 64 characters." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});

// Schema for validating login data in auth services
export const loginDataSchema = z.object({
    email: z
        .string({ required_error: "Email is required." })
        .nonempty({ message: "Email is required." })
        .email({ message: "Please provide a valid email address." }),
    password: z
        .string({ required_error: "Password is required." })
        .nonempty({ message: "Password is required." })
        .min(8, { message: "Password must be at least 8 characters long." }),
});
