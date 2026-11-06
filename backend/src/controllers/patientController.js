import Patient from "../models/Patient.js";

// Register a new patient
export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, email, address, medicalHistory } =
      req.body;

    if (!name || age === undefined || !gender || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, age, gender, and phone are required.",
      });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      address,
      medicalHistory,
    });

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully!",
      patient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register patient.",
    });
  }
};

// Get all patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients.",
    });
  }
};

// Update patient details
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient details updated successfully!",
      patient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update patient.",
    });
  }
};


// Delete a patient
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete patient.",
    });
  }
};
