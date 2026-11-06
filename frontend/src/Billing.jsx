
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Billing() {
    const [bills, setBills] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showBillForm, setShowBillForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        consultationFee: "",
        medicineCharges: 0,
        labCharges: 0,
    });

    const token = localStorage.getItem("medicare_token");

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    });

    // Fetch patients, doctors and bills
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [billResponse, patientResponse, doctorResponse] =
                await Promise.all([
                    fetch(`${API}/bills`, { headers: getHeaders() }),
                    fetch(`${API}/patients`, { headers: getHeaders() }),
                    fetch(`${API}/doctors`, { headers: getHeaders() }),
                ]);

            const billData = await billResponse.json();
            const patientData = await patientResponse.json();
            const doctorData = await doctorResponse.json();

            if (!billResponse.ok) {
                throw new Error(billData.message || "Failed to load bills");
            }

            if (!patientResponse.ok) {
                throw new Error(patientData.message || "Failed to load patients");
            }

            if (!doctorResponse.ok) {
                throw new Error(doctorData.message || "Failed to load doctors");
            }

            setBills(billData.bills || []);
            setPatients(patientData.patients || []);
            setDoctors(doctorData.doctors || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate total amount
    const totalAmount =
        Number(formData.consultationFee || 0) +
        Number(formData.medicineCharges || 0) +
        Number(formData.labCharges || 0);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "doctor") {
            const selectedDoctor = doctors.find(
                (doctor) => doctor._id === value
            );

            setFormData((prev) => ({
                ...prev,
                doctor: value,
                consultationFee: selectedDoctor
                    ? selectedDoctor.consultationFee
                    : "",
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Create new bill
    const handleCreateBill = async (e) => {
        e.preventDefault();

        if (!formData.patient || !formData.doctor) {
            alert("Please select patient and doctor");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`${API}/bills`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    patient: formData.patient,
                    doctor: formData.doctor,
                    consultationFee: Number(formData.consultationFee),
                    medicineCharges: Number(formData.medicineCharges),
                    labCharges: Number(formData.labCharges),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create bill");
            }

            alert("Bill created successfully!");

            setFormData({
                patient: "",
                doctor: "",
                consultationFee: "",
                medicineCharges: 0,
                labCharges: 0,
            });

            setShowBillForm(false);
            await fetchData();

        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Update payment status
    const handlePaymentStatus = async (billId, currentStatus) => {
        const newStatus = currentStatus === "paid" ? "pending" : "paid";

        try {
            const response = await fetch(
                `${API}/bills/${billId}/status`,
                {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        paymentStatus: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update payment");
            }

            alert("Payment status updated successfully!");
            await fetchData();

        } catch (err) {
            alert(err.message);
        }
    };

    // Calculate revenue
    const totalRevenue = bills
        .filter((bill) => bill.paymentStatus === "paid")
        .reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);

    const pendingAmount = bills
        .filter((bill) => bill.paymentStatus === "pending")
        .reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);

    // Currency format
    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    // Search and payment filter
    const filteredBills = bills.filter((bill) => {
        const patientName = bill.patient?.name || "";
        const doctorName = bill.doctor?.name || "";

        const matchesSearch =
            patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            bill.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <main className="main-content billing-page">
            <header className="topbar billing-topbar">
                <div>
                    <p className="breadcrumb">Pages / Billing</p>
                    <h1>Billing & Payments</h1>
                    <p>Manage patient bills and payment records.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowBillForm(!showBillForm)}
                >
                    {showBillForm ? "Close Form" : "+ Create New Bill"}
                </button>
            </header>

            {error && (
                <div className="error-message">
                    {error}
                    <button type="button" onClick={fetchData}>
                        Retry
                    </button>
                </div>
            )}

            {/* BILLING STATISTICS */}
            <section className="stats-grid">
                <div className="stat-card">
                    <h3>Total Bills</h3>
                    <h2>{bills.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <h2>{formatCurrency(totalRevenue)}</h2>
                </div>

                <div className="stat-card">
                    <h3>Pending Amount</h3>
                    <h2>{formatCurrency(pendingAmount)}</h2>
                </div>
            </section>

            {/* CREATE BILL FORM */}
            {showBillForm && (
                <section className="panel billing-panel">
                    <div className="panel-header">
                        <h2>Create New Bill</h2>
                    </div>

                    <form
                        onSubmit={handleCreateBill}
                        className="billing-form"
                    >
                        <div className="form-group">
                            <label>Patient</label>
                            <select
                                name="patient"
                                value={formData.patient}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Patient</option>

                                {patients.map((patient) => (
                                    <option key={patient._id} value={patient._id}>
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Doctor</label>
                            <select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Doctor</option>

                                {doctors.map((doctor) => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {doctor.name} - {doctor.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Consultation Fee (₹)</label>
                            <input
                                type="number"
                                name="consultationFee"
                                value={formData.consultationFee}
                                readOnly
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Medicine Charges (₹)</label>
                            <input
                                type="number"
                                name="medicineCharges"
                                min="0"
                                value={formData.medicineCharges}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Lab Charges (₹)</label>
                            <input
                                type="number"
                                name="labCharges"
                                min="0"
                                value={formData.labCharges}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="bill-total">
                            <h3>Total Amount: {formatCurrency(totalAmount)}</h3>
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? "Creating..." : "Create Bill"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowBillForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* ALL BILLS */}
            <section className="panel billing-panel">
                <div className="panel-header">
                    <div>
                        <h2>All Bills</h2>
                        <p>View and manage patient payment records.</p>
                    </div>
                </div>

                {/* SEARCH AND FILTER */}
                <div className="billing-filters">
                    <input
                        type="text"
                        placeholder="Search patient or doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading bills...</p>
                ) : filteredBills.length === 0 ? (
                    <p>No bills found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Consultation</th>
                                    <th>Medicine</th>
                                    <th>Lab</th>
                                    <th>Total Amount</th>
                                    <th>Payment Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill._id}>
                                        <td>{bill.patient?.name || "N/A"}</td>
                                        <td>{bill.doctor?.name || "N/A"}</td>
                                        <td>{formatCurrency(bill.consultationFee)}</td>
                                        <td>{formatCurrency(bill.medicineCharges)}</td>
                                        <td>{formatCurrency(bill.labCharges)}</td>
                                        <td>
                                            <strong>
                                                {formatCurrency(bill.totalAmount)}
                                            </strong>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    bill.paymentStatus === "paid"
                                                        ? "paid-status"
                                                        : "pending-status"
                                                }
                                            >
                                                {bill.paymentStatus?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handlePaymentStatus(
                                                        bill._id,
                                                        bill.paymentStatus
                                                    )
                                                }
                                            >
                                                {bill.paymentStatus === "paid"
                                                    ? "Mark Pending"
                                                    : "Mark Paid"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Billing;
