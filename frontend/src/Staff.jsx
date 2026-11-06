
import { useEffect, useState } from "react";

const API = "https://medicare-hms-b92s.onrender.com/api";

function Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [salarySort, setSalarySort] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        role: "",
        department: "",
        salary: "",
        joiningDate: "",
        address: "",
        status: "Active",
    });

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("medicare_token")}`,
        "Content-Type": "application/json",
    });

    // FETCH STAFF
    const fetchStaff = async () => {
        try {
            const response = await fetch(`${API}/staff`, {
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load staff");
            }

            setStaff(data.staff || []);

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // HANDLE INPUT CHANGE
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            gender: "",
            role: "",
            department: "",
            salary: "",
            joiningDate: "",
            address: "",
            status: "Active",
        });

        setEditingStaff(null);
    };

    // ADD / UPDATE STAFF
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                editingStaff
                    ? `${API}/staff/${editingStaff._id}`
                    : `${API}/staff`,
                {
                    method: editingStaff ? "PUT" : "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        ...formData,
                        salary: Number(formData.salary),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save staff");
            }

            alert(
                editingStaff
                    ? "Staff updated successfully!"
                    : "Staff added successfully!"
            );

            resetForm();
            setShowForm(false);

            await fetchStaff();

        } catch (error) {
            alert(error.message);
        }
    };

    // EDIT STAFF
    const handleEdit = (item) => {
        setEditingStaff(item);

        setFormData({
            name: item.name || "",
            email: item.email || "",
            phone: item.phone || "",
            gender: item.gender || "",
            role: item.role || "",
            department: item.department || "",
            salary: item.salary || "",
            joiningDate: item.joiningDate
                ? item.joiningDate.split("T")[0]
                : "",
            address: item.address || "",
            status: item.status || "Active",
        });

        setShowForm(true);
    };

    // DELETE STAFF
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this staff member?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API}/staff/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete staff");
            }

            alert("Staff deleted successfully!");

            await fetchStaff();

        } catch (error) {
            alert(error.message);
        }
    };

    // SEARCH AND FILTER STAFF
    const filteredStaff = staff
        .filter((item) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                (item.name || "").toLowerCase().includes(searchText) ||
                (item.email || "").toLowerCase().includes(searchText) ||
                (item.role || "").toLowerCase().includes(searchText) ||
                (item.department || "").toLowerCase().includes(searchText);

            const matchesDepartment =
                departmentFilter === "All" ||
                item.department === departmentFilter;

            const matchesStatus =
                statusFilter === "All" ||
                item.status === statusFilter;

            return matchesSearch && matchesDepartment && matchesStatus;
        })
        .sort((a, b) => {
            if (salarySort === "low") {
                return Number(a.salary) - Number(b.salary);
            }

            if (salarySort === "high") {
                return Number(b.salary) - Number(a.salary);
            }

            return 0;
        });


    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentStaff = filteredStaff.slice(
        startIndex,
        startIndex + itemsPerPage
    );


    return (
        <div className="main-content staff-page">

            {/* HEADER */}
            <div className="staff-header">
                <div>
                    <h1>Staff Management</h1>
                    <p>Manage your hospital staff members.</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            resetForm();
                        } else {
                            resetForm();
                            setShowForm(true);
                        }
                    }}
                >
                    + Add Staff
                </button>
            </div>

            {/* DASHBOARD STATISTICS */}
            <div className="staff-stats-grid">

                <div className="staff-stat-card">
                    <h3>Total Staff</h3>
                    <h2>{staff.length}</h2>
                </div>

                <div className="staff-stat-card">
                    <h3>Active Staff</h3>
                    <h2>
                        {staff.filter(item => item.status === "Active").length}
                    </h2>
                </div>

                <div className="staff-stat-card">
                    <h3>Inactive Staff</h3>
                    <h2>
                        {staff.filter(item => item.status === "Inactive").length}
                    </h2>
                </div>

                <div className="staff-stat-card">
                    <h3>Total Nurses</h3>
                    <h2>
                        {staff.filter(item => item.role === "Nurse").length}
                    </h2>
                </div>

            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
                <div className="staff-form-card">

                    <h2>
                        {editingStaff ? "Edit Staff" : "Add New Staff"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="staff-form-grid">

                            <input
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                name="phone"
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Nurse">Nurse</option>
                                <option value="Receptionist">Receptionist</option>
                                <option value="Lab Technician">Lab Technician</option>
                                <option value="Pharmacist">Pharmacist</option>
                                <option value="Ward Boy">Ward Boy</option>
                                <option value="Accountant">Accountant</option>
                            </select>

                            <input
                                name="department"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />

                            <input
                                name="salary"
                                type="number"
                                min="0"
                                placeholder="Monthly Salary"
                                value={formData.salary}
                                onChange={handleChange}
                                required
                            />

                            <input
                                name="joiningDate"
                                type="date"
                                value={formData.joiningDate}
                                onChange={handleChange}
                                required
                            />

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <textarea
                                name="address"
                                placeholder="Full Address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <button type="submit">
                            {editingStaff ? "Update Staff" : "Save Staff"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>

                    </form>
                </div>
            )}

            {/* SEARCH AND FILTERS */}
            <div className="staff-search">

                <input
                    type="text"
                    placeholder="Search by name, email, role or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                    <option value="All">All Departments</option>

                    {[...new Set(
                        staff.map(item => item.department).filter(Boolean)
                    )].map(dept => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <select
                    value={salarySort}
                    onChange={(e) => setSalarySort(e.target.value)}
                >
                    <option value="default">Default Order</option>
                    <option value="low">Salary: Low to High</option>
                    <option value="high">Salary: High to Low</option>
                </select>

            </div>


            {/* STAFF TABLE */}
            <div className="staff-table-card">

                <h2>All Staff Members</h2>

                {loading ? (
                    <p>Loading staff...</p>
                ) : (
                    <div className="table-container">

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Salary</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentStaff.length > 0 ? (
                                    currentStaff.map(item => (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.phone}</td>
                                            <td>{item.role}</td>
                                            <td>{item.department}</td>
                                            <td>₹{item.salary}</td>
                                            <td>{item.address || "N/A"}</td>

                                            <td>
                                                <span className={
                                                    item.status === "Active"
                                                        ? "active-status"
                                                        : "inactive-status"
                                                }>
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="staff-actions">
                                                    <button
                                                        type="button"
                                                        className="staff-edit-btn"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="staff-delete-btn"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9">
                                            No staff records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                )}

                {/* PAGINATION */}
                {!loading && (
                    <div className="staff-pagination">

                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {totalPages || 1}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Staff;
