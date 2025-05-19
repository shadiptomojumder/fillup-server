import ApiError from "@/errors/ApiError";
import { paginationHelpers } from "@/helpers/paginationHelper";
import { IAuthUser, IGenericResponse } from "@/interfaces/common";
import { IPaginationOptions } from "@/interfaces/pagination";
import {
    deleteFromCloudinary,
    uploadSingleOnCloudinary,
} from "@/shared/cloudinary";
import { extractCloudinaryPublicId } from "@/shared/extractCloudinaryPublicId";
import { normalizePhoneNumber } from "@/shared/normalizePhoneNumber";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose, { FilterQuery } from "mongoose";
import { User } from "./user.model";
import { updateUserSchema } from "./user.schemas";

// Function to get single user by userID
const getSingleUser = async (req: Request) => {
    try {
        const { userId } = req.params;
        // Fetch the user by ID
        const user = await User.findById(userId)
            .select("-password -refreshToken")
            .lean()
            .exec();

        if (!user)
            throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");

        // Manually map _id to id and remove __v
        const { _id, __v, ...rest } = user;
        const sanitizedUser = { id: _id, ...rest };

        return sanitizedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while fetching user:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function to get all user with filters and pagination
const getAllUser = async (
    filters: any,
    options: IPaginationOptions,
    authUser: IAuthUser
): Promise<IGenericResponse<InstanceType<typeof User>[]>> => {
    try {
        const { limit, page, skip } =
            paginationHelpers.calculatePagination(options);

        // Only allow filtering by these keys
        const allowedFilterKeys = ["firstName", "lastName", "phone", "email"];
        const andConditions: FilterQuery<typeof User>[] = [];

        Object.keys(filters).forEach((key) => {
            if (allowedFilterKeys.includes(key)) {
                // Case-insensitive partial match for string fields
                andConditions.push({
                    [key]: { $regex: filters[key], $options: "i" },
                });
            }
        });

        // Combine all conditions
        const whereConditions =
            andConditions.length > 0 ? { $and: andConditions } : {};

        // Query the database
        const result = await User.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort(
                options.sortBy && options.sortOrder
                    ? { [options.sortBy]: options.sortOrder === "asc" ? 1 : -1 }
                    : { createdAt: 1 }
            )
            .exec();

        const total = await User.countDocuments(whereConditions);

        return {
            meta: {
                total,
                page,
                limit,
            },
            data: result,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while getting all User:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

const updateUser = async (req: Request) => {
    try {
        const { userId } = req.params;
        console.log("User Id: ", userId);
        console.log("Request Body Is: ", req.body);
        const file = req.file as Express.Multer.File;

        // Prevent changing the email field first
        if ("email" in req.body) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                "You cannot change your registered email"
            );
        }

        // Fetch user from the database to determine their signup method
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        // Validate the request body against the product schema
        const parseBody = updateUserSchema.safeParse(req.body);
        console.log("The parseBody is:", parseBody);

        // If validation fails, collect error messages and throw a BAD_REQUEST error
        if (!parseBody.success) {
            const errorMessages = parseBody.error.errors
                .map((error) => error.message)
                .join(",");
            throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
        }

        // Allowed fields for update
        const allowedFields = [
            "firstName",
            "lastName",
            "phone",
            "avatar",
            "role",
        ];

        // Filter out unwanted fields
        const updateData: Record<string, any> = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // Normalize phone number if provided
        if (updateData.phone) {
            updateData.phone = normalizePhoneNumber(updateData.phone);
        }

        // Handle image update
        if (file) {
            // Delete old image from Cloudinary
            if (existingUser.avatar) {
                const publicId = extractCloudinaryPublicId(existingUser.avatar);
                await deleteFromCloudinary(publicId);
            }

            // Upload new thumbnail
            const result = await uploadSingleOnCloudinary(file.path, "users");
            if (result?.secure_url) updateData.avatar = result.secure_url;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true, // Return updated document
            runValidators: true, // Run Mongoose validators
        });

        return updatedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while updating user:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function to Delete single user by UserID
const deleteSingleUser = async (req: Request) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "User ID is required");
        }

        // Validate userId format if using MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid User ID or format"
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        await User.findByIdAndDelete(userId);

        return { message: "User deleted successfully" };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while deleting the user:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function for delete Multiple users
const deleteMultipleUsers = async (req: Request) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "'ids' must be a non-empty array"
            );
        }

        // Validate the ids to ensure they're valid ObjectId strings
        const invalidIds = ids.filter(
            (id) => !mongoose.Types.ObjectId.isValid(id)
        );
        if (invalidIds.length > 0) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Invalid User Id(s): ${invalidIds.join(", ")}`
            );
        }

        // Fetch all users to ensure they exist
        const existingUsers = await User.find({ _id: { $in: ids } });
        if (existingUsers.length !== ids.length) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "One or more user IDs do not exist"
            );
        }

        // Delete users from database
        const result = await User.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount !== ids.length) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Some users could not be deleted"
            );
        }

        return {
            message: `${result.deletedCount} users deleted successfully`,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while deleting the users:${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

export const UserServices = {
    getSingleUser,
    getAllUser,
    updateUser,
    deleteSingleUser,
    deleteMultipleUsers,
};
