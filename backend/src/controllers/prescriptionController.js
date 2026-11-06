import mongoose from "mongoose";
import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// CREATE PRESCRIPTION
export const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      diagnosis,
      medicines,
      notes,
    } = req.body;

    if (!patient || !doctor || !diagnosis?.trim() ||
        !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient, doctor, diagnosis and medicines are required.",
      });
    }

    if (
      !mongoose.isValidObjectId(patient) ||
      !mongoose.isValidObjectId(doctor)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient or doctor ID.",
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

    const prescription = await Prescription.create({
      patient,
      doctor,
      diagnosis: diagnosis.trim(),
      medicines,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully!",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription.",
    });
  }
};

// GET ALL PRESCRIPTIONS
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions.",
    });
  }
};

// GET SINGLE PRESCRIPTION
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID.",
      });
    }

    const prescription = await Prescription.findById(id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription.",
    });
  }
};

// UPDATE PRESCRIPTION
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, medicines, notes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID.",
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    if (diagnosis !== undefined) {
      if (typeof diagnosis !== "string" || !diagnosis.trim()) {
        return res.status(400).json({
          success: false,
          message: "Diagnosis cannot be empty.",
        });
      }

      prescription.diagnosis = diagnosis.trim();
    }

    if (medicines !== undefined) {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one medicine is required.",
        });
      }

      prescription.medicines = medicines;
    }

    if (notes !== undefined) {
      prescription.notes = notes;
    }

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully!",
      prescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update prescription.",
    });
  }
};

// DELETE PRESCRIPTION
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID.",
      });
    }

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully!",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription.",
    });
  }
};
