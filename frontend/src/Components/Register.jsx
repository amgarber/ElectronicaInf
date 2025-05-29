import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCar } from 'react-icons/fa';
import '../css/Register.css';

/*
const API_URL = 'http://localhost:5050'; // Cambialo si usás otra IP o puerto
*/
const API_URL = 'http://54.243.184.8:5050';



const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/registrarUsuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="container">
        <div className="form-container success-container">
          <h2>¡Registro Exitoso!</h2>
          <p>Tu cuenta ha sido creada correctamente</p>
          <button onClick={() => navigate('/login')} className="submit-button">
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <FaUser className="icon" />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <FaUser className="icon" />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <FaEnvelope className="icon" />
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
          <FaLock className="icon" />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <p className="login-link">
          ¿Ya tienes una cuenta? <span onClick={() => navigate('/login')}>Iniciar Sesión</span>
        </p>
      </form>
    </div>
  );
};


export default Register;
