import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import '../css/Login.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testUser = {
    email: 'test@test.com',
    password: 'test123'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Modo demo: test user sin backend
      if (formData.email === testUser.email && formData.password === testUser.password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 🔸 No hay token en este caso, es solo modo demo
        navigate('/home');
        return;
      }

      // Login real con backend
      const response = await fetch(`${API_URL}/api/login`,  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // 🔐 Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuarioNombre', data.usuario.nombre); // opcional

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <button className="back-button" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back
        </button>
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
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
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
          </div>
          <button
              type="submit"
              className="submit-button"
              disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="register-link">
            Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
          </p>
        </form>
      </div>
  );
};

export default Login;
