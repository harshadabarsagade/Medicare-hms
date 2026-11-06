import Staff from "../models/Staff.js";

// ADD STAFF
export const createStaff = async (req, res) => {
    try {
        const staff = await Staff.create(req.body);

        res.status(201).json({
            success: true,
            message: "Staff added successfully",
            staff,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.code === 11000
                ? "Email already exists"
                : error.message,
        });
    }
};

// GET ALL STAFF
export const getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            staff,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// UPDATE STAFF
export const updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            staff,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.code === 11000
                ? "Email already exists"
                : error.message,
        });
    }
};


// DELETE STAFF
export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
