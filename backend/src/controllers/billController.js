
import Bill from "../models/Bill.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// Create Bill
export const createBill = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      consultationFee,
      medicineCharges = 0,
      labCharges = 0,
    } = req.body;

    if (!patient || !doctor || consultationFee === undefined) {
      return res.status(400).json({
        success: false,
        message: "Patient, doctor and consultation fee are required",
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

    const consultation = Number(consultationFee);
    const medicine = Number(medicineCharges);
    const lab = Number(labCharges);

    if (
      !Number.isFinite(consultation) ||
      !Number.isFinite(medicine) ||
      !Number.isFinite(lab) ||
      consultation < 0 ||
      medicine < 0 ||
      lab < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Charges must be valid non-negative numbers",
      });
    }

    const totalAmount = consultation + medicine + lab;

    const bill = await Bill.create({
      patient,
      doctor,
      consultationFee: consultation,
      medicineCharges: medicine,
      labCharges: lab,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Bill generated successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payment Status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["paid", "pending"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
