import React, { useState } from 'react';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import '../css/ChangePassword.css';
import {useNavigate} from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ChangePassword = ({ onBack, onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await fetch(`${API_URL}/api/ChangePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      onSuccess('Contraseña cambiada exitosamente');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <button className="back-button" onClick={() => navigate('/profile')}>
        <FaArrowLeft /> Volver
      </button>
      
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Cambiar Contraseña</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <FaLock className="icon" />
          <input
            type="password"
            name="currentPassword"
            placeholder="Contraseña actual"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <FaLock className="icon" />
          <input
            type="password"
            name="newPassword"
            placeholder="Nueva contraseña"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <FaLock className="icon" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar nueva contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword; 