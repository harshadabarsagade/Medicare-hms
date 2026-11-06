function AddPatient({ onBack }) {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const patientData = {
            name: formData.get('name'),
            age: Number(formData.get('age')),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            medicalHistory: formData.get('medicalHistory'),
        };

       try {
    const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('medicare_token')}`,
        },
        body: JSON.stringify(patientData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to register patient');
    }

    alert('Patient registered successfully!');
    e.target.reset();

} catch (error) {
    console.error('Registration error:', error);
    alert(error.message);
}
    };
    return (
        <div className="main-content">
            <header className="topbar">
                <div>
                    <p className="breadcrumb">Pages / Patients / Add New</p>
                    <h1>Add New Patient</h1>
                    <button
                        type="button"
                        className="text-button"
                        onClick={onBack}
                    >
                        ← Back to Patients
                    </button>
                    <p>Enter patient details to create a new record.</p>
                </div>
            </header>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Patient Information</h2>
                        <p>Fill in the patient's personal and medical details.</p>
                    </div>
                </div>

               <form onSubmit={handleSubmit} className="patient-form">
                    <div>
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="Enter full name" required />
                    </div>

                    <div>
                        <label>Age</label>
                        <input type="number" name="age" placeholder="Enter age" min="0" required />
                    </div>

                    <div>
                        <label>Gender</label>
                        <select name="gender" defaultValue="" required>
                            <option value="" disabled>Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label>Phone Number</label>
                        <input type="tel" name="phone" placeholder="Enter phone number" required />
                    </div>

                    <div>
                        <label>Email</label>
                        <input type="email" name="email" placeholder="Enter email address" />
                    </div>

                    <div>
                        <label>Address</label>
                        <textarea name="address" placeholder="Enter full address" rows="3" />
                    </div>

                    <div>
                        <label>Medical History</label>
                        <textarea name="medicalHistory" placeholder="Enter medical history, if any" rows="3" />
                    </div>

                    <button type="submit" className="primary-button">
                        Register Patient
                    </button>
                </form>
            </section>
        </div>
    );
}

export default AddPatient;