import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },
        role: {
            type: String,
            enum: [
                "Nurse",
                "Receptionist",
                "Lab Technician",
                "Pharmacist",
                "Ward Boy",
                "Accountant",
            ],
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
        },
        joiningDate: {
            type: Date,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;