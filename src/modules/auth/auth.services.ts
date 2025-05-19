import { loginDataSchema, signupDataSchema } from "@/auth/auth.schemas";
import ApiError from "@/errors/ApiError";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../users/user.model";
import { AuthUtils, hashedPassword } from "./auth.utils";

// Signup function to register a new user
const signup = async (req: Request) => {
    try {
        // Validate the request body against the user schema
        const parseBody = signupDataSchema.safeParse(req.body);
        if (!parseBody.success) {
            // If validation fails, collect error messages and throw a BAD_REQUEST error
            const errorMessages = parseBody.error.errors
                .map((error) => error.message)
                .join(",");
            throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
        }
        console.log("The parseBody is:", parseBody);

        // Normalize email
        const email = parseBody.data.email.toLowerCase();
        const { password, ...rest } = parseBody.data;

        // Check if a user with the same email already exists
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            throw new ApiError(StatusCodes.CONFLICT, "User already exists");
        }

        // Hash the user's password before storing it in the database
        const hashPassword = await hashedPassword(password);

        // Create a new user in the database with the hashed password
        const result = await User.create({
            ...rest,
            email,
            password: hashPassword,
        });

        // Convert to plain object and remove sensitive fields
        const userObj: Partial<typeof result> = result.toObject();
        delete userObj.password;

        return userObj;
    } catch (error) {
        console.log("Error creating user", error);

        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while creating USER:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Login function to authenticate a user
const login = async (req: Request) => {
    try {
        // Validate the request body against the loginData schema
        const parseBody = loginDataSchema.safeParse(req.body);

        // If validation fails, collect error messages and throw a BAD_REQUEST error
        if (!parseBody.success) {
            const errorMessages = parseBody.error.errors
                .map((error) => error.message)
                .join(",");
            throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
        }

        const email = parseBody.data.email.toLowerCase();
        const password = parseBody.data.password;

        // 1. Fetch user with password for validation
        const userWithPassword = await User.findOne({ email })
            .select("+password")
            .lean()
            .exec();

        console.log("userWithPassword:", userWithPassword);

        if (!userWithPassword) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Invalid email or password."
            );
        }

        // 2. Compare password
        const isPasswordValid = await AuthUtils.comparePasswords(
            password,
            userWithPassword.password
        );
        if (!isPasswordValid) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Invalid email or password."
            );
        }

        // 3. Fetch user again without sensitive fields (or remove them manually)
        const {
            password: _,
            refreshToken: __,
            __v,
            _id,
            ...rest
        } = userWithPassword;
        const sanitizedUser = {
            id: _id,
            ...rest,
        };

        // Generate JWT tokens for authentication and authorization
        let accessToken, refreshToken;
        try {
            accessToken = AuthUtils.generateToken({
                id: userWithPassword._id.toString(),
                email: userWithPassword.email,
                role: userWithPassword.role,
            });
            refreshToken = AuthUtils.generateToken({
                id: userWithPassword._id.toString(),
                email: userWithPassword.email,
                role: userWithPassword.role,
            });
        } catch (error) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to generate authentication tokens"
            );
        }

        // Save the refreshToken in the database
        await User.findByIdAndUpdate(userWithPassword._id, { refreshToken });

        return {
            data: {
                user: sanitizedUser,
                accessToken,
            },
        };
    } catch (error) {
        console.log("The Login service Error:", error);

        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while login USER:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

export const AuthServices = {
    signup,
    login,
};
