import ApiError from "@/errors/ApiError";
import { paginationHelpers } from "@/helpers/paginationHelper";
import { IAuthUser, IGenericResponse } from "@/interfaces/common";
import { IPaginationOptions } from "@/interfaces/pagination";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose, { FilterQuery } from "mongoose";

import { User } from "../users/user.model";
import { Profile } from "./profile.model";
import { createProfileSchema, updateProfileSchema } from "./profile.schemas";

// Function to get single user by userID
const createProfile = async (req: Request) => {
    try {
        // Validate request body against schema
        const parseBody = createProfileSchema.safeParse(req.body);
        if (!parseBody.success) {
            const errorMessages = parseBody.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
        }

        const { userId } = parseBody.data;

        // Check if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid userId or format."
            );
        }

        // Check if user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "User not found for the provided userId."
            );
        }

        // Create and return the profile
        const profile = await Profile.create(parseBody.data);

        // Check if profile was actually created
        if (!profile) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Profile could not be created"
            );
        }

        return profile;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while creating the profile: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function to get all profile with filters and pagination
const getAllProfile = async (
    filters: any,
    options: IPaginationOptions,
    authUser: IAuthUser
): Promise<IGenericResponse<InstanceType<typeof Profile>[]>> => {
    try {
        const { limit, page, skip } =
            paginationHelpers.calculatePagination(options);

        // Define allowed filter keys for job profiles
        const allowedFilterKeys = ["userId", "name", "email", "mobile"];
        const andConditions: FilterQuery<typeof Profile>[] = [];

        Object.keys(filters).forEach((key) => {
            if (allowedFilterKeys.includes(key)) {
                if (
                    key === "userId" &&
                    mongoose.Types.ObjectId.isValid(filters[key])
                ) {
                    andConditions.push({
                        [key]: new mongoose.Types.ObjectId(filters[key]),
                    });
                } else {
                    andConditions.push({
                        [key]: { $regex: filters[key], $options: "i" },
                    });
                }
            }
        });

        const whereConditions =
            andConditions.length > 0 ? { $and: andConditions } : {};

        const result = await Profile.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort(
                options.sortBy && options.sortOrder
                    ? { [options.sortBy]: options.sortOrder === "asc" ? 1 : -1 }
                    : { createdAt: -1 }
            )
            .exec();

        const total = await Profile.countDocuments(whereConditions);

        return {
            meta: {
                total,
                page,
                limit,
            },
            data: result,
        };
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while getting all profiles: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function to get single profile by profileID
const getSingleProfile = async (req: Request) => {
    try {
        const { profileId } = req.params;

        if (!profileId) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Profile ID is required"
            );
        }

        if (!mongoose.Types.ObjectId.isValid(profileId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Invalid profile ID format"
            );
        }

        const profile = await Profile.findById(profileId);

        if (!profile) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
        }

        return profile;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while fetching the profile: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
};

// Function to update profile
const updateProfile = async (req: Request) => {
    try {
        const { profileId } = req.params;

        if (!profileId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Profile ID is required");
        }

        if (!mongoose.Types.ObjectId.isValid(profileId)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid profile ID format");
        }

        // Prevent userId update
        if ("userId" in req.body) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot update userId");
        }

        // Validate request body against update schema
        const parseBody = updateProfileSchema.safeParse(req.body);
        if (!parseBody.success) {
            const errorMessages = parseBody.error.errors.map(e => e.message).join(", ");
            throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
        }

        // Only allow updating fields defined in the schema
        const updateData = parseBody.data;

        const updatedProfile = await Profile.findByIdAndUpdate(
            profileId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
        }

        return updatedProfile;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `An unexpected error occurred while updating the profile: ${
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

export const ProfileServices = {
    createProfile,
    getAllProfile,
    getSingleProfile,
    updateProfile,
    getAllUser,
    deleteSingleUser,
    deleteMultipleUsers,
};
