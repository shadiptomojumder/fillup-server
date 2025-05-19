import { normalizePhoneNumber } from "@/shared/normalizePhoneNumber";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: { type: String, unique: true, sparse: true },
        jobProfiles: [],
        role: {
            type: String,
            default: "USER",
        },
        avatar: {
            type: String,
            sparse: true, // Helps avoid creating a blank index
        },
        otp: {
            type: Number,
            sparse: true, // Helps avoid creating a blank index
        },
        password: {
            type: String,
            required: true,
            select: false, // Exclude from query results
        },
        refreshToken: {
            type: String,
            select: false, // Exclude from query results
        },
    },
    {
        timestamps: true,
    }
);

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v; // Optional: remove __v
    },
});

// Pre-save hook to normalize phone numbers
userSchema.pre("save", function (next) {
    if (this.phone) {
        this.phone = normalizePhoneNumber(this.phone);
    }
    next();
});

export const User = mongoose.model("User", userSchema);
