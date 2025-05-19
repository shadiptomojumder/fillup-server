import * as z from "zod";

// Regex patterns for phone number validation Bangladesh only
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

// Nested schemas for present_address, ssc, hsc (all fields required except group_other, board_other)
const presentAddressSchema = z.object({
    careof: z.string({ required_error: "Care of is required" }),
    village: z.string({ required_error: "Village is required" }),
    district: z.string({ required_error: "District is required" }),
    upazila: z.string({ required_error: "Upazila is required" }),
    post: z.string({ required_error: "Post is required" }),
    postcode: z.string({ required_error: "Postcode is required" }),
});

const sscHscSchema = z.object({
    exam: z.string({ required_error: "Exam is required" }),
    roll: z.string({ required_error: "Roll is required" }),
    group: z.string({ required_error: "Group is required" }),
    group_other: z.string().optional().nullable(),
    board: z.string({ required_error: "Board is required" }),
    board_other: z.string().optional().nullable(),
    result_type: z.string({ required_error: "Result type is required" }),
    result: z.number({ required_error: "Result is required" }),
    year: z.string({ required_error: "Year is required" }),
});

export const createProfileSchema = z.object({
    userId: z.string({ required_error: "User ID is required" }).min(1, { message: "User ID cannot be empty" }),
    name: z.string({ required_error: "Name is required" }),
    name_bn: z.string({ required_error: "Bangla name is required" }),
    father: z.string({ required_error: "Father's name is required" }),
    father_bn: z.string({ required_error: "Father's Bangla name is required" }),
    mother: z.string({ required_error: "Mother's name is required" }),
    mother_bn: z.string({ required_error: "Mother's Bangla name is required" }),
    dob: z.coerce.date({ required_error: "Date of birth is required" }),
    gender: z.string({ required_error: "Gender is required" }),

    nid: z.string({ required_error: "NID is required" }),
    nid_no: z.string().optional(), // Required if nid === "1", handle in service or with refine
    breg: z.string().optional(),   // Required if nid === "0", handle in service or with refine
    passport: z.string().optional(),

    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
    mobile: z.string({ required_error: "Mobile is required" }).regex(bdPhoneRegex, { message: "Mobile must be a valid Bangladeshi phone number" }),
    confirm_mobile: z.string({ required_error: "Confirm mobile is required" }).regex(bdPhoneRegex, { message: "Confirm mobile must be a valid Bangladeshi phone number" }),

    nationality: z.string({ required_error: "Nationality is required" }),
    religion: z.string({ required_error: "Religion is required" }),
    marital_status: z.string({ required_error: "Marital status is required" }),
    quota: z.string({ required_error: "Quota is required" }),
    dep_status: z.string().optional(),

    present_address: presentAddressSchema,
    ssc: sscHscSchema,
    hsc: sscHscSchema,
});

// Update schema: all fields optional, userId cannot be updated
export const updateProfileSchema = createProfileSchema
    .omit({ userId: true })
    .partial();