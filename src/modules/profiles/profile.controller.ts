import ApiResponse from "@/shared/ApiResponse";
import asyncErrorHandler from "@/shared/asyncErrorHandler";
import pick from "@/shared/pick";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IAuthUser } from "../../interfaces/common";
import { ProfileServices } from "./profile.services";
import { profileFilterAbleFields } from "./profile.utils";

// Controller function to create a new Profile
const createProfile = asyncErrorHandler(async (req: Request, res: Response) => {
    const product = await ProfileServices.createProfile(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Successfully Created",
        data: product,
    });
});

// Controller function to get all user
const getAllProfile = asyncErrorHandler(async (req: Request, res: Response) => {
    const filters: Record<string, any> = pick(
        req.query,
        profileFilterAbleFields
    );
    const options: Record<string, any> = pick(req.query, [
        "limit",
        "page",
        "sortBy",
        "sortOrder",
    ]);
    const user: IAuthUser = req.user as IAuthUser;

    const result = await ProfileServices.getAllProfile(filters, options, user);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All profiles retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

// Controller function to get single profile by profileId
const getSingleProfile = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await ProfileServices.getSingleProfile(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

// Controller function update profile
const updateProfile = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await ProfileServices.updateProfile(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});


// Controller function fo delete single user by UserID
const deleteSingleProfile = asyncErrorHandler(
    async (req: Request, res: Response) => {
        const result = await ProfileServices.deleteSingleProfile(req);
        ApiResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: result.message,
        });
    }
);

// Controller function fo delete mulyiple user
const deleteMultipleProfiles = asyncErrorHandler(
    async (req: Request, res: Response) => {
        const result = await ProfileServices.deleteMultipleProfiles(req);
        ApiResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: result.message,
        });
    }
);

export const ProfileController = {
    createProfile,
    getAllProfile,
    getSingleProfile,
    updateProfile,
    deleteSingleProfile,
    deleteMultipleProfiles,
};
