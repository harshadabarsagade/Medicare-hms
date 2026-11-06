import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// Book a new appointment
export const createAppointment = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            appointmentDate,
            reason,
            notes,
        } = req.body;

        if (!patient || !doctor || !appointmentDate || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required appointment details.",
            });
        }

        const patientExists = await Patient.findById(patient);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        const doctorExists = await Doctor.findById(doctor);

        if (!doctorExists) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found.",
            });
        }

        if (!doctorExists.available) {
            return res.status(400).json({
                success: false,
                message: "Doctor is currently unavailable.",
            });
        }

        const parsedDate = new Date(appointmentDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid appointment date.",
            });
        }

        if (parsedDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Appointment must be scheduled for a future date.",
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor,
            appointmentDate: parsedDate,
            status: "scheduled",
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This doctor already has an appointment at this time.",
            });
        }



        const appointment = await Appointment.create({
            patient,
            doctor,
            appointmentDate: parsedDate,
            reason,
            notes,
        });

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to book appointment.",
        });
    }
};

// Get all appointments
export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patient", "name email phone")
            .populate("doctor", "name specialization consultationFee")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments.",
        });
    }
};


// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "scheduled",
            "completed",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status.",
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment status updated successfully!",
            appointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update appointment status.",
        });
    }
};


// Delete appointment
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment deleted successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete appointment.",
        });
    }
};
