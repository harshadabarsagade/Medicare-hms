import MedicalHistory from "../models/MedicalHistory.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// Create Medical History
export const createMedicalHistory = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      previousDiseases,
      symptoms,
      diagnosis,
      treatment,
      doctorNotes,
      visitDate,
    } = req.body;

    if (!patient || !doctor || !symptoms || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Patient, doctor, symptoms and diagnosis are required",
      });
    }

    const patientExists = await Patient.findById(patient);
    const doctorExists = await Doctor.findById(doctor);

    if (!patientExists || !doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Patient or doctor not found",
      });
    }

    const history = await MedicalHistory.create({
      patient,
      doctor,
      previousDiseases,
      symptoms,
      diagnosis,
      treatment,
      doctorNotes,
      visitDate,
    });

    res.status(201).json({
      success: true,
      message: "Medical history created successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Medical Histories
export const getMedicalHistories = async (req, res) => {
  try {
    const histories = await MedicalHistory.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: histories.length,
      histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Medical History By Patient
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const histories = await MedicalHistory.find({
      patient: req.params.patientId,
    })
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: histories.length,
      histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Medical History
export const updateMedicalHistory = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      previousDiseases,
      symptoms,
      diagnosis,
      treatment,
      doctorNotes,
      visitDate,
    } = req.body;

    const history = await MedicalHistory.findByIdAndUpdate(
      req.params.id,
      {
        patient,
        doctor,
        previousDiseases,
        symptoms,
        diagnosis,
        treatment,
        doctorNotes,
        visitDate,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Medical history not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical history updated successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Medical History
export const deleteMedicalHistory = async (req, res) => {
  try {
    const history = await MedicalHistory.findByIdAndDelete(
      req.params.id
    );

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Medical history not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical history deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};