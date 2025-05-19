import express, { Router } from "express";
import { ProfileController } from "./profile.controller";

const router = express.Router();

// Route to create new profile
router.post("", ProfileController.createProfile);

// Route to get all Profile
router.get("", ProfileController.getAllProfile);

// Route to get single Profile by profileId
router.get("/:profileId", ProfileController.getSingleProfile);

// Route to update profile
router.patch("/:profileId", ProfileController.updateProfile);

// Delete single user by ID
// router.delete("/:userId", UserController.deleteSingleUser);

// // Delete multiple users
// router.delete("", UserController.deleteMultipleUsers);

export const Profiles: Router = router;
