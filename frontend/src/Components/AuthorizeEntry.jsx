import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import '../css/AuthorizeEntry.css';

const AuthorizeEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licensePlate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/authorize-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al autorizar entrada');
      }

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Error al autorizar entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home')}>
            <FaArrowLeft /> Back
          </button>
        </div>
        <div className="header-right">
          <h1>Authorize Entry</h1>
        </div>
      </header>

      <main className="main">
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <FaCar className="icon" />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <FaCar className="icon" />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <FaCar className="icon" />
            <input
              type="text"
              name="licensePlate"
              placeholder="License Plate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Authorizing...' : 'Authorize Entry'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AuthorizeEntry;

