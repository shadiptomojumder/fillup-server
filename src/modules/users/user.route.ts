import { upload } from "@/middlewares/multer.middleware";
import express, { Router } from "express";
import { UserController } from "./user.controller";

const router = express.Router();

// Route to get all users
router.get("", UserController.getAllUser);

// Route to get a user by ID
router.get("/:userId", UserController.getSingleUser);

// Route to Update an User
router.patch("/:userId", upload.single("avatar"), UserController.updateUser);

// Delete single user by ID
router.delete("/:userId", UserController.deleteSingleUser);

// Delete multiple users
router.delete("", UserController.deleteMultipleUsers);

export const UserRoutes: Router = router;
