import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    previousDiseases: {
      type: String,
      default: "",
    },

    symptoms: {
      type: String,
      required: true,
    },

    diagnosis: {
      type: String,
      required: true,
    },

    treatment: {
      type: String,
      default: "",
    },

    doctorNotes: {
      type: String,
      default: "",
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const MedicalHistory = mongoose.model(
  "MedicalHistory",
  medicalHistorySchema
);

export default MedicalHistory;