
import { useEffect, useState } from "react";

const API = "https://medicare-hms-b92s.onrender.com/api";

function MedicalHistory() {
    const [histories, setHistories] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [editingHistory, setEditingHistory] = useState(null);

    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        previousDiseases: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        doctorNotes: "",
    });

    const token = localStorage.getItem("medicare_token");

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [historyRes, patientRes, doctorRes] = await Promise.all([
                fetch(`${API}/medical-history`, {
                    headers: getHeaders(),
                }),
                fetch(`${API}/patients`, {
                    headers: getHeaders(),
                }),
                fetch(`${API}/doctors`, {
                    headers: getHeaders(),
                }),
            ]);

            const historyData = await historyRes.json();
            const patientData = await patientRes.json();
            const doctorData = await doctorRes.json();

            if (!historyRes.ok || !patientRes.ok || !doctorRes.ok) {
                throw new Error(
                    historyData.message ||
                    patientData.message ||
                    doctorData.message ||
                    "Failed to load data"
                );
            }

            setHistories(historyData.histories || []);
            setPatients(patientData.patients || []);
            setDoctors(doctorData.doctors || []);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };



    const handleEdit = (history) => {
        setEditingHistory(history);

        setFormData({
            patient: history.patient?._id || "",
            doctor: history.doctor?._id || "",
            previousDiseases: history.previousDiseases || "",
            symptoms: history.symptoms || "",
            diagnosis: history.diagnosis || "",
            treatment: history.treatment || "",
            doctorNotes: history.doctorNotes || "",
        });

        setShowForm(true);
        setSelectedHistory(null);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this medical record?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API}/medical-history/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete medical history");
            }

            alert("Medical history deleted successfully!");

            await fetchData();

        } catch (error) {
            alert(error.message);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                editingHistory
                    ? `${API}/medical-history/${editingHistory._id}`
                    : `${API}/medical-history`,
                {
                    method: editingHistory ? "PUT" : "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save medical history");
            }

            alert(
                editingHistory
                    ? "Medical history updated successfully!"
                    : "Medical history added successfully!"
            );

            setFormData({
                patient: "",
                doctor: "",
                previousDiseases: "",
                symptoms: "",
                diagnosis: "",
                treatment: "",
                doctorNotes: "",
            });

            setEditingHistory(null);
            setShowForm(false);

            await fetchData();

        } catch (error) {
            alert(error.message);
        }
    };

    const filteredHistories = histories.filter((history) => {
        const searchText = search.toLowerCase();

        return (
            history.patient?.name?.toLowerCase().includes(searchText) ||
            history.doctor?.name?.toLowerCase().includes(searchText) ||
            history.diagnosis?.toLowerCase().includes(searchText) ||
            history.symptoms?.toLowerCase().includes(searchText)
        );
    });

    if (loading) {
        return <div className="loading">Loading medical history...</div>;
    }

    return (
        <main className="main-content medical-history-page">
            <header className="topbar">
                <div>
                    <p className="breadcrumb">Pages / Medical History</p>
                    <h1>Medical History</h1>
                    <p>Manage patient medical records and treatment history.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Close Form" : "+ Add Medical History"}
                </button>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <h3>Total Records</h3>
                    <h2>{histories.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Total Patients</h3>
                    <h2>{patients.length}</h2>
                </div>

                <div className="stat-card">
                    <h3>Total Doctors</h3>
                    <h2>{doctors.length}</h2>
                </div>
            </section>

            {showForm && (
                <section className="panel medical-history-form">
                    <div className="panel-header">
                        <h2>{editingHistory ? "Edit Medical Record" : "Add Medical Record"}</h2>
                        <p>Enter patient diagnosis and treatment details.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
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
                                <label>Doctor *</label>
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
                                <label>Previous Diseases</label>
                                <input
                                    type="text"
                                    name="previousDiseases"
                                    value={formData.previousDiseases}
                                    onChange={handleChange}
                                    placeholder="Previous diseases"
                                />
                            </div>

                            <div className="form-group">
                                <label>Symptoms *</label>
                                <input
                                    type="text"
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                    placeholder="Enter symptoms"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Diagnosis *</label>
                                <input
                                    type="text"
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    placeholder="Enter diagnosis"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Treatment</label>
                                <input
                                    type="text"
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleChange}
                                    placeholder="Treatment details"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Doctor Notes</label>
                                <textarea
                                    name="doctorNotes"
                                    value={formData.doctorNotes}
                                    onChange={handleChange}
                                    placeholder="Additional doctor notes"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit">
                                {editingHistory ? "Update Medical Record" : "Save Medical Record"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Patient Medical Records</h2>
                        <p>View all patient medical history records.</p>
                    </div>
                </div>

                <div className="medical-history-search">
                    <input
                        type="text"
                        placeholder="Search patient, doctor, diagnosis..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="button" onClick={fetchData}>
                        Refresh
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Symptoms</th>
                                <th>Diagnosis</th>
                                <th>Treatment</th>
                                <th>Visit Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredHistories.length > 0 ? (
                                filteredHistories.map((history) => (
                                    <tr key={history._id}>
                                        <td>
                                            <strong>
                                                {history.patient?.name || "Unknown"}
                                            </strong>
                                            <br />
                                            {history.patient?.phone || ""}
                                        </td>

                                        <td>{history.doctor?.name || "Unknown"}</td>

                                        <td>{history.symptoms}</td>

                                        <td>{history.diagnosis}</td>

                                        <td>{history.treatment || "N/A"}</td>

                                        <td>
                                            {history.visitDate
                                                ? new Date(history.visitDate).toLocaleDateString("en-IN")
                                                : "N/A"}
                                        </td>


                                        <td>


                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() => setSelectedHistory(history)}
                                            >
                                                View Details
                                            </button>


                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() => handleEdit(history)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() => handleDelete(history._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No medical records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {selectedHistory && (
                <div className="modal-overlay">
                    <section className="modal-content medical-history-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Medical Record Details</h2>
                                <p>Complete patient medical information</p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setSelectedHistory(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="medical-details-grid">
                            <div>
                                <label>Patient Name</label>
                                <p>{selectedHistory.patient?.name || "N/A"}</p>
                            </div>

                            <div>
                                <label>Doctor Name</label>
                                <p>{selectedHistory.doctor?.name || "N/A"}</p>
                            </div>

                            <div>
                                <label>Previous Diseases</label>
                                <p>{selectedHistory.previousDiseases || "N/A"}</p>
                            </div>

                            <div>
                                <label>Symptoms</label>
                                <p>{selectedHistory.symptoms || "N/A"}</p>
                            </div>

                            <div>
                                <label>Diagnosis</label>
                                <p>{selectedHistory.diagnosis || "N/A"}</p>
                            </div>

                            <div>
                                <label>Treatment</label>
                                <p>{selectedHistory.treatment || "N/A"}</p>
                            </div>

                            <div className="full-width">
                                <label>Doctor Notes</label>
                                <p>{selectedHistory.doctorNotes || "N/A"}</p>
                            </div>

                            <div>
                                <label>Visit Date</label>
                                <p>
                                    {selectedHistory.visitDate
                                        ? new Date(selectedHistory.visitDate).toLocaleDateString("en-IN")
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setSelectedHistory(null)}
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}

        </main>
    );
}


export default MedicalHistory;
