import { Request, Response } from "express";
import mongoose from "mongoose";
import app from "../app";
import connectDB from "../db/dbConnection";

// Vercel serverless function handler
// This function will be called by Vercel when a request is made to the serverless function
export default async function handler(req: Request, res: Response) {
    // Check the MongoDB connection status by inspecting mongoose.connection.readyState
    if (mongoose.connection.readyState === 0) {  // 0 means disconnected
        try {
            await connectDB();  // This will attempt to connect MongoDB
            console.log("MongoDB Connected inside Vercel function!");
        } catch (error) {
            console.error("MongoDB connection failed:", error);
            return res.status(500).json({ message: "Database connection failed" });
        }
    }

    // Now pass the request to the Express app
    app(req, res);  // Vercel-specific, but make sure app is set up correctly
}
