import './App.css';
import './login.css';
import Billing from './Billing';
import Reports from './Reports';
import MedicalHistory from './MedicalHistory';
import Staff from './Staff';


import { useEffect, useState } from 'react';
import Login from './Login';
import AddAppointment from './AddAppointment';
import AddPatient from './AddPatient';

const API = 'http://localhost:5000/api';

function App() {
  // ===== STATES =====

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('medicare_token'))
  );

  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [prescriptionSearch, setPrescriptionSearch] = useState('');

  const [doctorSearch, setDoctorSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  const [patientSearch, setPatientSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 10;

  const [prescriptionForm, setPrescriptionForm] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    medicines: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ],
    notes: '',
  });

  // ===== AUTH HEADERS =====

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('medicare_token')}`,
  });

  // ===== FETCH ALL DATA =====

  const fetchData = async () => {
    if (!localStorage.getItem('medicare_token')) return;

    setLoading(true);
    setError('');

    try {
      const endpoints = [
        `${API}/dashboard/stats`,
        `${API}/patients`,
        `${API}/appointments`,
        `${API}/doctors`,
        `${API}/prescriptions`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, { headers: getHeaders() })
        )
      );

      const results = await Promise.all(
        responses.map((response) => response.json())
      );

      const failedIndex = responses.findIndex(
        (response) => !response.ok
      );

      if (failedIndex !== -1) {
        throw new Error(
          results[failedIndex].message ||
          `Failed to load data from ${endpoints[failedIndex]}`
        );
      }

      setStats(results[0].stats || {});
      setPatients(results[1].patients || []);
      setAppointments(results[2].appointments || []);
      setDoctors(results[3].doctors || []);
      setPrescriptions(results[4].prescriptions || []);

    } catch (err) {
      setError(err.message || 'Failed to load hospital data.');
    } finally {
      setLoading(false);
    }
  };

  // ===== LOAD DATA AFTER LOGIN =====

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // ===== LOGIN SUCCESS =====

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // ===== REFRESH APPOINTMENTS =====

  const handleAppointmentAdded = async () => {
    try {
      const response = await fetch(`${API}/appointments`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Failed to refresh appointments:', error);
    }
  };


  // ===== UPDATE APPOINTMENT STATUS =====

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `${API}/appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update appointment status');
      }

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );

      alert('Appointment status updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // ===== DELETE APPOINTMENT =====

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete appointment');
      }

      setAppointments((previous) =>
        previous.filter((appointment) => appointment._id !== appointmentId)
      );

      alert('Appointment deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // ===== PATIENT SEARCH AND FILTER =====

  const filteredPatients = patients.filter((patient) => {
    const search = patientSearch.toLowerCase().trim();

    const matchesSearch =
      patient.name?.toLowerCase().includes(search) ||
      String(patient.phone || '').includes(search);

    const matchesGender =
      genderFilter === 'all' ||
      patient.gender?.toLowerCase() === genderFilter;

    return matchesSearch && matchesGender;
  });

  const totalPages = Math.ceil(
    filteredPatients.length / patientsPerPage
  );

  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  // ===== APPOINTMENT SEARCH AND FILTER =====

  const filteredAppointments = appointments.filter((appointment) => {
    const search = appointmentSearch.toLowerCase().trim();

    const matchesSearch =
      appointment.patient?.name?.toLowerCase().includes(search) ||
      appointment.doctor?.name?.toLowerCase().includes(search) ||
      appointment.status?.toLowerCase().includes(search);

    const matchesStatus =
      appointmentStatusFilter === 'all' ||
      appointment.status?.toLowerCase() === appointmentStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // ===== DOCTOR SEARCH AND FILTER =====

  const filteredDoctors = doctors.filter((doctor) => {
    const search = doctorSearch.toLowerCase().trim();

    const matchesSearch =
      doctor.name?.toLowerCase().includes(search) ||
      doctor.email?.toLowerCase().includes(search) ||
      String(doctor.phone || '').includes(search);

    const matchesSpecialization =
      specializationFilter === 'all' ||
      doctor.specialization?.toLowerCase() ===
      specializationFilter.toLowerCase();

    return matchesSearch && matchesSpecialization;
  });

  const specializations = [
    ...new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ),
  ];

  // ===== ADD OR UPDATE DOCTOR =====

  const handleSaveDoctor = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const doctorData = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      specialization: formData.get('specialization').trim(),
      qualification: formData.get('qualification').trim(),
      experience: Number(formData.get('experience')),
      consultationFee: Number(formData.get('consultationFee')),
      available: formData.get('available') === 'true',
    };

    try {
      const isEditing = Boolean(editingDoctor);

      const response = await fetch(
        isEditing
          ? `${API}/doctors/${editingDoctor._id}`
          : `${API}/doctors`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doctorData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save doctor.');
      }

      if (isEditing) {
        setDoctors((previous) =>
          previous.map((doctor) =>
            doctor._id === editingDoctor._id ? data.doctor : doctor
          )
        );
      } else {
        setDoctors((previous) => [data.doctor, ...previous]);
      }

      setStats((previous) => ({
        ...previous,
        totalDoctors: isEditing
          ? previous.totalDoctors
          : previous.totalDoctors + 1,
      }));

      setShowDoctorForm(false);
      setEditingDoctor(null);

      alert(
        isEditing
          ? 'Doctor updated successfully!'
          : 'Doctor added successfully!'
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ===== SAVE PRESCRIPTION =====

  const handleSavePrescription = async (event) => {
    event.preventDefault();

    try {
      const url = editingPrescription
        ? `${API}/prescriptions/${editingPrescription._id}`
        : `${API}/prescriptions`;

      const response = await fetch(url, {
        method: editingPrescription ? 'PATCH' : 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save prescription');
      }

      alert(data.message || 'Prescription saved successfully!');

      setShowPrescriptionForm(false);
      setEditingPrescription(null);

      setPrescriptionForm({
        patient: '',
        doctor: '',
        diagnosis: '',
        medicines: [
          {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
          },
        ],
        notes: '',
      });

      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  // ===== DELETE PRESCRIPTION =====

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete prescription');
      }

      alert(data.message || 'Prescription deleted successfully!');

      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  // ===== DELETE DOCTOR =====

  const handleDeleteDoctor = async (doctor) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/doctors/${doctor._id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete doctor.');
      }

      setDoctors((previous) =>
        previous.filter((item) => item._id !== doctor._id)
      );

      setStats((previous) => ({
        ...previous,
        totalDoctors: Math.max(0, previous.totalDoctors - 1),
      }));

      alert('Doctor deleted successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // ===== DELETE PATIENT =====

  const handleDeletePatient = async (patient) => {
    if (!window.confirm(`Delete patient ${patient.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/patients/${patient._id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete patient.');
      }

      setPatients((previous) =>
        previous.filter((item) => item._id !== patient._id)
      );

      setStats((previous) => ({
        ...previous,
        totalPatients: Math.max(0, previous.totalPatients - 1),
      }));

      alert('Patient deleted successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // ===== LOGIN PAGE =====

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ===== MAIN UI =====

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>MediCare</h2>
            <span>Hospital Management</span>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>


        <nav className="navigation">
          {[
            ['dashboard', '▦', 'Dashboard'],
            ['patients', '♙', 'Patients'],
            ['doctors', '⚕', 'Doctors'],
            ['appointments', '▣', 'Appointments'],
            ['prescriptions', '▤', 'Prescriptions'],
            ['billing', '₹', 'Billing & Payments'],
            ['reports', '📊', 'Reports & Analytics'],
            ['medical-history', '📋', 'Medical History'],
            ['staff', '👥', 'Staff Management'],
          ].map(([page, icon, label]) => (
            <button
              key={page}
              type="button"
              className={`nav-item ${activePage === page ? 'active' : ''}`}
              onClick={() => {
                setActivePage(page);
                setShowAddPatient(false);
                setEditingPatient(null);
                setShowDoctorForm(false);
                setEditingDoctor(null);
                setShowPrescriptionForm(false);
                setEditingPrescription(null);
              }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>


        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <h3>Need help?</h3>
            <p>Contact our support team for assistance.</p>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={() => {
              localStorage.removeItem('medicare_token');
              setIsLoggedIn(false);
              setActivePage('dashboard');
            }}
          >
            ↪ <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* DASHBOARD */}
      {activePage === 'dashboard' &&
        !showAddPatient &&
        !editingPatient &&
        !showDoctorForm && (
          <main className="main-content">
            <header className="topbar">
              <div>
                <p className="breadcrumb">Pages / Dashboard</p>
                <h1>Dashboard Overview</h1>
              </div>
            </header>

            {error && <p className="error-message">{error}</p>}

            <section className="welcome-banner">
              <div className="welcome-text">
                <span className="welcome-tag">ADMINISTRATION</span>
                <h2>Welcome to MediCare! 👋</h2>
                <p>
                  Manage patients, doctors and appointments from one place.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setActivePage('doctors')}
                >
                  Manage Doctors →
                </button>
              </div>

              <div className="welcome-illustration" aria-hidden="true">
                <div className="illustration-circle">
                  <div className="medical-cross">✚</div>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-icon patients-icon">♙</div>
                <p>Total Patients</p>
                <h2>{loading ? '...' : stats.totalPatients ?? patients.length}</h2>
                <span className="stat-caption">Registered patients</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon doctors-icon">⚕</div>
                <p>Total Doctors</p>
                <h2>{loading ? '...' : doctors.length}</h2>
                <span className="stat-caption">Medical professionals</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon appointments-icon">▣</div>
                <p>Total Appointments</p>
                <h2>
                  {loading ? '...' : stats.totalAppointments ?? appointments.length}
                </h2>
                <span className="stat-caption">Recorded appointments</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon completed-icon">✓</div>
                <p>Completed Visits</p>
                <h2>
                  {loading ? '...' : stats.completedAppointments ?? 0}
                </h2>
                <span className="stat-caption">Completed appointments</span>
              </article>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Frequently used hospital operations.</p>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setActivePage('doctors');
                    setEditingDoctor(null);
                    setShowDoctorForm(true);
                  }}
                >
                  + Add Doctor
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowAddPatient(true)}
                >
                  + Register Patient
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setActivePage('appointments')}
                >
                  View Appointments
                </button>
              </div>
            </section>
          </main>
        )}

      {/* DOCTOR MANAGEMENT */}
      {activePage === 'doctors' && (
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="breadcrumb">Pages / Doctors</p>
              <h1>Doctor Management</h1>
              <p>Manage your hospital's medical professionals.</p>
            </div>

            {!showDoctorForm && (
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setEditingDoctor(null);
                  setShowDoctorForm(true);
                }}
              >
                + Add Doctor
              </button>
            )}
          </header>

          {error && <p className="error-message">{error}</p>}

          {showDoctorForm ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>{editingDoctor ? 'Edit Doctor' : 'Register New Doctor'}</h2>
                  <p>Enter the doctor's professional details.</p>
                </div>
              </div>

              <form className="doctor-form" onSubmit={handleSaveDoctor}>
                <div className="form-group">
                  <label htmlFor="doctor-name">Full Name *</label>
                  <input
                    id="doctor-name"
                    name="name"
                    defaultValue={editingDoctor?.name || ''}
                    placeholder="Dr. Rahul Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-email">Email *</label>
                  <input
                    id="doctor-email"
                    name="email"
                    type="email"
                    defaultValue={editingDoctor?.email || ''}
                    placeholder="doctor@hospital.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-phone">Phone *</label>
                  <input
                    id="doctor-phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingDoctor?.phone || ''}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-specialization">Specialization *</label>
                  <input
                    id="doctor-specialization"
                    name="specialization"
                    list="specialization-options"
                    defaultValue={editingDoctor?.specialization || ''}
                    placeholder="e.g. Cardiology"
                    required
                  />

                  <datalist id="specialization-options">
                    <option value="Cardiology" />
                    <option value="Dermatology" />
                    <option value="Neurology" />
                    <option value="Pediatrics" />
                    <option value="Orthopedics" />
                    <option value="General Medicine" />
                    <option value="Gynecology" />
                    <option value="Ophthalmology" />
                    <option value="Psychiatry" />
                    <option value="Dentistry" />
                  </datalist>
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-qualification">Qualification *</label>
                  <input
                    id="doctor-qualification"
                    name="qualification"
                    defaultValue={editingDoctor?.qualification || ''}
                    placeholder="e.g. MBBS, MD"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-experience">Experience (years) *</label>
                  <input
                    id="doctor-experience"
                    name="experience"
                    type="number"
                    min="0"
                    defaultValue={editingDoctor?.experience ?? ''}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-fee">Consultation Fee (₹) *</label>
                  <input
                    id="doctor-fee"
                    name="consultationFee"
                    type="number"
                    min="0"
                    defaultValue={editingDoctor?.consultationFee ?? ''}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctor-availability">Availability</label>
                  <select
                    id="doctor-availability"
                    name="available"
                    defaultValue={String(editingDoctor?.available ?? true)}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button">
                    {editingDoctor ? 'Save Changes' : 'Register Doctor'}
                  </button>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setShowDoctorForm(false);
                      setEditingDoctor(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Registered Doctors</h2>
                  <p>{filteredDoctors.length} doctor(s) found</p>
                </div>
              </div>

              <div className="patient-search">
                <input
                  type="search"
                  placeholder="Search name, email or phone..."
                  value={doctorSearch}
                  onChange={(event) => setDoctorSearch(event.target.value)}
                />

                <select
                  value={specializationFilter}
                  onChange={(event) =>
                    setSpecializationFilter(event.target.value)
                  }
                >
                  <option value="all">All Specializations</option>
                  {specializations.map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>DOCTOR</th>
                      <th>SPECIALIZATION</th>
                      <th>QUALIFICATION</th>
                      <th>EXPERIENCE</th>
                      <th>CONSULTATION FEE</th>
                      <th>AVAILABILITY</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7">Loading doctors...</td></tr>
                    ) : filteredDoctors.length === 0 ? (
                      <tr>
                        <td colSpan="7">
                          No doctors found. Click “Add Doctor” to register one.
                        </td>
                      </tr>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td>
                            <strong>{doctor.name}</strong>
                            <span className="table-subtitle">{doctor.email}</span>
                            <span className="table-subtitle">{doctor.phone}</span>
                          </td>

                          <td>{doctor.specialization}</td>
                          <td>{doctor.qualification}</td>
                          <td>{doctor.experience} years</td>
                          <td>₹{doctor.consultationFee}</td>

                          <td>
                            <span
                              className={`status-badge ${doctor.available
                                  ? 'completed-status'
                                  : 'cancelled-status'
                                }`}
                            >
                              {doctor.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>

                          <td>
                            <div className="patient-actions">
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => {
                                  setEditingDoctor(doctor);
                                  setShowDoctorForm(true);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="text-button delete-button"
                                onClick={() => handleDeleteDoctor(doctor)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      )}

      {/* PATIENT REGISTRATION */}
      {showAddPatient && (
        <AddPatient
          onBack={() => {
            setShowAddPatient(false);
            setActivePage('patients');
            fetchData();
          }}
        />
      )}

      {/* EDIT PATIENT */}
      {editingPatient && (
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="breadcrumb">Pages / Patients / Edit</p>
              <h1>Edit Patient</h1>
            </div>
          </header>

          <section className="panel">
            <form
              className="doctor-form"
              onSubmit={async (event) => {
                event.preventDefault();

                const formData = new FormData(event.currentTarget);

                const updatedPatient = {
                  name: formData.get('name'),
                  age: Number(formData.get('age')),
                  gender: formData.get('gender'),
                  phone: formData.get('phone'),
                  email: formData.get('email'),
                  address: formData.get('address'),
                  medicalHistory: formData.get('medicalHistory'),
                };

                try {
                  const response = await fetch(
                    `${API}/patients/${editingPatient._id}`,
                    {
                      method: 'PUT',
                      headers: {
                        ...getHeaders(),
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(updatedPatient),
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message || 'Failed to update patient.');
                  }

                  setPatients((previous) =>
                    previous.map((patient) =>
                      patient._id === editingPatient._id
                        ? { ...patient, ...data.patient, ...updatedPatient }
                        : patient
                    )
                  );

                  setEditingPatient(null);
                  setActivePage('patients');
                  alert('Patient updated successfully!');
                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" defaultValue={editingPatient.name} required />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <input
                  name="age"
                  type="number"
                  min="0"
                  defaultValue={editingPatient.age}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" defaultValue={editingPatient.gender} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input name="phone" defaultValue={editingPatient.phone} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingPatient.email || ''}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input name="address" defaultValue={editingPatient.address || ''} />
              </div>

              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medicalHistory"
                  defaultValue={editingPatient.medicalHistory || ''}
                />
              </div>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="text-button"
                  onClick={() => setEditingPatient(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </main>
      )}

      {/* PATIENTS PAGE */}
      {activePage === 'patients' &&
        !showAddPatient &&
        !editingPatient && (
          <main className="main-content">
            <header className="topbar">
              <div>
                <p className="breadcrumb">Pages / Patients</p>
                <h1>Patients Management</h1>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => setShowAddPatient(true)}
              >
                + Register Patient
              </button>
            </header>

            {error && <p className="error-message">{error}</p>}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>All Patients</h2>
                  <p>{filteredPatients.length} patient(s) found</p>
                </div>
              </div>

              <div className="patient-search">
                <input
                  type="search"
                  placeholder="Search patient name or phone..."
                  value={patientSearch}
                  onChange={(event) => {
                    setPatientSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                />

                <select
                  value={genderFilter}
                  onChange={(event) => {
                    setGenderFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>PATIENT NAME</th>
                      <th>AGE</th>
                      <th>GENDER</th>
                      <th>PHONE</th>
                      <th>EMAIL</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6">Loading patients...</td></tr>
                    ) : currentPatients.length === 0 ? (
                      <tr><td colSpan="6">No matching patients found.</td></tr>
                    ) : (
                      currentPatients.map((patient) => (
                        <tr key={patient._id}>
                          <td>{patient.name}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>{patient.phone}</td>
                          <td>{patient.email || 'N/A'}</td>

                          <td>
                            <div className="patient-actions">
                              <button
                                type="button"
                                className="text-button"
                                onClick={() => setEditingPatient(patient)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="text-button delete-button"
                                onClick={() => handleDeletePatient(patient)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  disabled={totalPages === 0 || currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  Next
                </button>
              </div>
            </section>
          </main>
        )}

      {/* APPOINTMENTS PAGE */}
      {activePage === 'appointments' && (
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="breadcrumb">Pages / Appointments</p>
              <h1>Appointments</h1>
              <p>View and manage scheduled patient visits.</p>
            </div>
          </header>

          <AddAppointment
            patients={patients}
            doctors={doctors}
            onAppointmentAdded={handleAppointmentAdded}
          />

          {error && <p className="error-message">{error}</p>}

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>All Appointments</h2>
                <p>{filteredAppointments.length} appointment(s) found</p>
              </div>

              <span className="stat-badge">
                Total: {appointments.length}
              </span>
            </div>

            <div className="patient-search">
              <input
                type="search"
                placeholder="Search patient, doctor or status..."
                value={appointmentSearch}
                onChange={(event) => setAppointmentSearch(event.target.value)}
              />
            </div>

            <div className="appointment-filters">
              <select
                value={appointmentStatusFilter}
                onChange={(event) =>
                  setAppointmentStatusFilter(event.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>DOCTOR</th>
                    <th>DATE & TIME</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan="5">Loading appointments...</td></tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr><td colSpan="5">No matching appointments found.</td></tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>
                          <strong>{appointment.patient?.name || 'N/A'}</strong>
                        </td>

                        <td>{appointment.doctor?.name || 'N/A'}</td>

                        <td>
                          {appointment.appointmentDate
                            ? new Date(
                              appointment.appointmentDate
                            ).toLocaleString('en-IN')
                            : 'N/A'}
                        </td>

                        <td>
                          <select
                            value={appointment.status}
                            onChange={(event) =>
                              handleUpdateAppointmentStatus(
                                appointment._id,
                                event.target.value
                              )
                            }
                            className={`status-select ${appointment.status?.toLowerCase()}`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="text-button delete-button"
                            onClick={() =>
                              handleDeleteAppointment(appointment._id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {/* PRESCRIPTION FORM MODAL */}
      {showPrescriptionForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {editingPrescription ? 'Edit Prescription' : 'Add Prescription'}
            </h2>

            <form onSubmit={handleSavePrescription}>
              <label>Patient</label>
              <select
                value={prescriptionForm.patient}
                onChange={(event) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    patient: event.target.value,
                  })
                }
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>

              <label>Doctor</label>
              <select
                value={prescriptionForm.doctor}
                onChange={(event) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    doctor: event.target.value,
                  })
                }
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>

              <label>Diagnosis</label>
              <input
                type="text"
                placeholder="Enter diagnosis"
                value={prescriptionForm.diagnosis}
                onChange={(event) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    diagnosis: event.target.value,
                  })
                }
                required
              />

              <h3>Medicine Details</h3>

              {prescriptionForm.medicines.map((medicine, index) => (
                <div key={index}>
                  <label>Medicine Name</label>
                  <input
                    value={medicine.name}
                    placeholder="Medicine name"
                    onChange={(event) => {
                      const updated = [...prescriptionForm.medicines];
                      updated[index].name = event.target.value;

                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: updated,
                      });
                    }}
                    required
                  />

                  <label>Dosage</label>
                  <input
                    value={medicine.dosage}
                    placeholder="e.g. 500 mg"
                    onChange={(event) => {
                      const updated = [...prescriptionForm.medicines];
                      updated[index].dosage = event.target.value;

                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: updated,
                      });
                    }}
                    required
                  />

                  <label>Frequency</label>
                  <input
                    value={medicine.frequency}
                    placeholder="e.g. Twice a day"
                    onChange={(event) => {
                      const updated = [...prescriptionForm.medicines];
                      updated[index].frequency = event.target.value;

                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: updated,
                      });
                    }}
                    required
                  />

                  <label>Duration</label>
                  <input
                    value={medicine.duration}
                    placeholder="e.g. 5 days"
                    onChange={(event) => {
                      const updated = [...prescriptionForm.medicines];
                      updated[index].duration = event.target.value;

                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: updated,
                      });
                    }}
                    required
                  />

                  <label>Instructions</label>
                  <input
                    value={medicine.instructions}
                    placeholder="e.g. After meals"
                    onChange={(event) => {
                      const updated = [...prescriptionForm.medicines];
                      updated[index].instructions = event.target.value;

                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: updated,
                      });
                    }}
                  />

                  {prescriptionForm.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = prescriptionForm.medicines.filter(
                          (_, i) => i !== index
                        );

                        setPrescriptionForm({
                          ...prescriptionForm,
                          medicines: updated,
                        });
                      }}
                    >
                      Remove Medicine
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    medicines: [
                      ...prescriptionForm.medicines,
                      {
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        instructions: '',
                      },
                    ],
                  })
                }
              >
                + Add Another Medicine
              </button>

              <label>Additional Notes</label>
              <textarea
                value={prescriptionForm.notes}
                onChange={(event) =>
                  setPrescriptionForm({
                    ...prescriptionForm,
                    notes: event.target.value,
                  })
                }
                placeholder="Enter additional notes"
              />

              <div className="form-actions">
                <button type="submit">
                  {editingPrescription
                    ? 'Update Prescription'
                    : 'Save Prescription'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionForm(false);
                    setEditingPrescription(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRESCRIPTIONS PAGE */}
      {activePage === 'prescriptions' && (
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="breadcrumb">Pages / Prescriptions</p>
              <h1>Prescription Management</h1>
              <p>Manage patient prescriptions and medicines.</p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setEditingPrescription(null);
                setPrescriptionForm({
                  patient: '',
                  doctor: '',
                  diagnosis: '',
                  medicines: [
                    {
                      name: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      instructions: '',
                    },
                  ],
                  notes: '',
                });
                setShowPrescriptionForm(true);
              }}
            >
              + Add Prescription
            </button>
          </header>

          {error && <p className="error-message">{error}</p>}

          <section className="panel prescription-panel">
            <input
              type="text"
              className="prescription-search"
              placeholder="Search by patient or diagnosis..."
              value={prescriptionSearch}
              onChange={(event) =>
                setPrescriptionSearch(event.target.value)
              }
            />

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Medicines</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {prescriptions
                    .filter((item) =>
                      `${item.patient?.name || ''} ${item.diagnosis || ''}`
                        .toLowerCase()
                        .includes(prescriptionSearch.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item._id}>
                        <td>{item.patient?.name || 'N/A'}</td>
                        <td>{item.doctor?.name || 'N/A'}</td>
                        <td>{item.diagnosis}</td>
                        <td>{item.medicines?.length || 0}</td>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPrescription(item);
                              setPrescriptionForm({
                                patient: item.patient?._id || '',
                                doctor: item.doctor?._id || '',
                                diagnosis: item.diagnosis || '',
                                medicines: item.medicines?.length
                                  ? item.medicines
                                  : [
                                      {
                                        name: '',
                                        dosage: '',
                                        frequency: '',
                                        duration: '',
                                        instructions: '',
                                      },
                                    ],
                                notes: item.notes || '',
                              });
                              setShowPrescriptionForm(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePrescription(item._id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                  {prescriptions.filter((item) =>
                    `${item.patient?.name || ''} ${item.diagnosis || ''}`
                      .toLowerCase()
                      .includes(prescriptionSearch.toLowerCase())
                  ).length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No prescriptions found. Add your first prescription.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {/* BILLING PAGE */}
      {activePage === 'billing' && <Billing />}
      {activePage === 'reports' && <Reports />}
      {activePage === 'medical-history' && <MedicalHistory />}
      {activePage === 'staff' && <Staff />}
    </div>
  );
}

export default App;
