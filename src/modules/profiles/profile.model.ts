import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        name_bn: { type: String, required: true },
        father: { type: String, required: true },
        father_bn: { type: String, required: true },
        mother: { type: String, required: true },
        mother_bn: { type: String, required: true },
        dob: { type: Date, required: true },
        gender: { type: String, required: true },

        nid: { type: String, required: true }, // 1 = Yes, 0 = No
        nid_no: {
            type: String,
            required: function (this: any) {
                return this.nid === "1";
            },
        },

        breg: { type: String }, // Birth Reg. Required if nid is "0"
        passport: { type: String },

        email: { type: String, required: true },
        mobile: { type: String, required: true },
        confirm_mobile: { type: String, required: true },

        nationality: { type: String, required: true },
        religion: { type: String, required: true },
        marital_status: { type: String, required: true },
        quota: { type: String, required: true },
        dep_status: { type: String },

        present_address: {
            careof: { type: String, required: true },
            village: { type: String, required: true },
            district: { type: String, required: true },
            upazila: { type: String, required: true },
            post: { type: String, required: true },
            postcode: { type: String, required: true },
        },

        ssc: {
            exam: { type: String, required: true },
            roll: { type: String, required: true },
            group: { type: String, required: true },
            group_other: { type: String },
            board: { type: String, required: true },
            board_other: { type: String },
            result_type: { type: String, required: true },
            result: { type: Number, required: true },
            year: { type: String, required: true },
        },

        hsc: {
            exam: { type: String, required: true },
            roll: { type: String, required: true },
            group: { type: String, required: true },
            group_other: { type: String },
            board: { type: String, required: true },
            board_other: { type: String },
            result_type: { type: String, required: true },
            result: { type: Number, required: true },
            year: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

ProfileSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v; // Optional: remove __v
    },
});

export const Profile = mongoose.model("Profile", ProfileSchema);
