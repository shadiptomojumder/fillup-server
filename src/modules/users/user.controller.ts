import ApiResponse from "@/shared/ApiResponse";
import asyncErrorHandler from "@/shared/asyncErrorHandler";
import pick from "@/shared/pick";
import { UserServices } from "./user.services";
import { userFilterAbleFields } from "./user.utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IAuthUser } from "../../interfaces/common";

// Controller function to get the profile of the authenticated user
const getSingleUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await UserServices.getSingleUser(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User data fetched!",
        data: result,
    });
});

// Controller function to get all user
const getAllUser = asyncErrorHandler(async (req: Request, res: Response) => {
    // Extract filters from the query parameters using the pick function and userFilterAbleFields array
    const filters: Record<string, any> = pick(req.query, userFilterAbleFields);
    const options: Record<string, any> = pick(req.query, [
        "limit",
        "page",
        "sortBy",
        "sortOrder",
    ]);
    const user: IAuthUser = req.user as IAuthUser;

    const result = await UserServices.getAllUser(filters, options, user);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All user retrieval successfully",
        meta: result.meta,
        data: result.data,
    });
});

// Controller function to update an User
const updateUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await UserServices.updateUser(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User successfully updated",
        data: result,
    });
});

// Controller function fo delete single user by UserID
const deleteSingleUser = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await UserServices.deleteSingleUser(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
    });
});


// Controller function fo delete mulyiple user
const deleteMultipleUsers = asyncErrorHandler(async (req: Request, res: Response) => {
    const result = await UserServices.deleteMultipleUsers(req);
    ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
    });
});

export const UserController = {
    getSingleUser,
    getAllUser,
    updateUser,
    deleteSingleUser,
    deleteMultipleUsers
};
