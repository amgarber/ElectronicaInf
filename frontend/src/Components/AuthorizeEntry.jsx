import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import '../css/AuthorizeEntry.css';

const AuthorizeEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    marca: '',
    modelo: '',
    patente: ''
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
      const response = await fetch('http://localhost:5050/api/authorize-entry', {
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
                  name="nombre"
                  placeholder="First Name"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                  type="text"
                  name="apellido"
                  placeholder="Last Name"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                  type="text"
                  name="marca"
                  placeholder="Marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                  type="text"
                  name="modelo"
                  placeholder="Modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <FaCar className="icon" />
              <input
                  type="text"
                  name="patente"
                  placeholder="License Plate"
                  value={formData.patente}
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
