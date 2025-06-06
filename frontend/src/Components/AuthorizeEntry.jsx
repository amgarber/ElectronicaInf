import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import '../css/AuthorizeEntry.css';

const API_URL = process.env.REACT_APP_API_URL;

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

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Iniciá sesión nuevamente.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/authorize-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al autorizar entrada');
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

            {['nombre', 'apellido', 'email', 'marca', 'modelo', 'patente'].map((field) => (
                <div className="form-group" key={field}>
                  <FaCar className="icon" />
                  <input
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                  />
                </div>
            ))}

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
