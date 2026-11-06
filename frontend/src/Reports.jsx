import { useEffect, useState } from "react";

const API = "https://medicare-hms-b92s.onrender.com/api";

function Reports() {
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("medicare_token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [billRes, appointmentRes, patientRes] = await Promise.all([
        fetch(`${API}/bills`, { headers: getHeaders() }),
        fetch(`${API}/appointments`, { headers: getHeaders() }),
        fetch(`${API}/patients`, { headers: getHeaders() }),
      ]);

      const billData = await billRes.json();
      const appointmentData = await appointmentRes.json();
      const patientData = await patientRes.json();

      if (!billRes.ok || !appointmentRes.ok || !patientRes.ok) {
        throw new Error("Failed to load reports");
      }

      setBills(billData.bills || []);
      setAppointments(appointmentData.appointments || []);
      setPatients(patientData.patients || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "paid"
  );

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "pending"
  );

  const totalRevenue = paidBills.reduce(
    (total, bill) => total + Number(bill.totalAmount || 0),
    0
  );

  const pendingAmount = pendingBills.reduce(
    (total, bill) => total + Number(bill.totalAmount || 0),
    0
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  );


    const today = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(
      appointment.appointmentDate
    ).toISOString().split("T")[0];

    return appointmentDate === today;
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = paidBills
    .filter((bill) => {
      const billDate = new Date(bill.createdAt);

      return (
        billDate.getMonth() === currentMonth &&
        billDate.getFullYear() === currentYear
      );
    })
    .reduce((total, bill) => total + Number(bill.totalAmount || 0), 0);

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <main className="main-content reports-page">
      <header className="topbar">
        <div>
          <p className="breadcrumb">Pages / Reports</p>
          <h1>Reports & Analytics</h1>
          <p>Hospital performance and financial overview.</p>
        </div>

        <button type="button" onClick={fetchReports}>
          Refresh Reports
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <h2>{patients.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Appointments</h3>
          <h2>{appointments.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <h2>{todayAppointments.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Bills</h3>
          <h2>{bills.length}</h2>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
        </div>

        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <h2>₹{monthlyRevenue.toLocaleString("en-IN")}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending Payments</h3>
          <h2>₹{pendingAmount.toLocaleString("en-IN")}</h2>
        </div>

        <div className="stat-card">
          <h3>Paid Bills</h3>
          <h2>{paidBills.length}</h2>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Appointment Summary</h2>
            <p>Appointment status overview</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Completed</h3>
            <h2>{completedAppointments.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Scheduled</h3>
            <h2>{scheduledAppointments.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Cancelled</h3>
            <h2>{cancelledAppointments.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Pending Bills</h3>
            <h2>{pendingBills.length}</h2>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Reports;