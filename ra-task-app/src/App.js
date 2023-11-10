import React, { useState } from 'react';
import './App.css'; // Import your CSS file for styling

const App = () => {
  const initialFormData = {
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    email: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [dobError, setDobError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear submission status on field change
    setSubmissionStatus(null);

    // Validate email using regex
    if (name === 'email') {
      const emailRegex = /.+@.+\..+/;
      setEmailError(emailRegex.test(value) ? '' : 'Invalid email address');
    }

    // Validate date of birth
    if (name === 'dob') {
      const today = new Date();
      const selectedDate = new Date(value);
      setDobError(selectedDate > today ? 'Date of birth cannot be in the future' : '');
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there is an email or dob error before submitting
    if (emailError || dobError) {
      setSubmissionStatus('Error: Please fix the form fields');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmissionStatus('PDF sent successfully!');
      } else {
        setSubmissionStatus('Error submitting the form. Please contact administration.');
      }
    } catch (error) {
      setSubmissionStatus('Error submitting the form. Please contact administration.');
      console.error('Error:', error);
    }
  };

  const handleSendAgain = () => {
    // Clear all field values
    setFormData(initialFormData);
    // Clear submission status
    setSubmissionStatus(null);
  };

  return (
    <div className="container">
      <h1 className="center">Block Center Service Form</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to respond">Prefer not to respond</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          {dobError && <p className="error-message">{dobError}</p>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>

        {/* Display "Send again" button instead of "Submit" button */}
        {!submissionStatus ? (
          <button type="submit">Submit</button>
        ) : (
          <button type="button" onClick={handleSendAgain}>
            Send again
          </button>
        )}
      </form>

      {submissionStatus && <p className="submission-status">{submissionStatus}</p>}

      {/* Additional information at the bottom right */}
      <div className="footer">
        <div className="footer-content">
          <p>cc@ Vatsal Sheth</p>
          <p>Student, Carnegie Mellon University</p>
        </div>
      </div>
    </div>
  );
};

export default App;
