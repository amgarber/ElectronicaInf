import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaUser } from 'react-icons/fa';
import '../css/Profile.css';
import ChangePassword from './ChangePassword';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');

        const res = await fetch(`${API_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener perfil');

        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChangeSuccess = (message) => {
    setSuccessMessage(message);
    setShowChangePassword(false);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (showChangePassword) {
    console.log("🧩 Renderizando componente ChangePassword");
    return (
        <ChangePassword
            onBack={() => setShowChangePassword(false)}
            onSuccess={handlePasswordChangeSuccess}
        />
    );
  }


  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home')}>
            <FaArrowLeft /> Back
          </button>
        </div>
        <div className="header-right">
          <h1>Profile</h1>
        </div>
      </header>

      <main className="main">
        <div className="profile-container">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : userData ? (
            <>
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              <div className="profile-section">
                <h2><FaUser /> Account Info</h2>
                <div className="info-card">
                  <p><strong>Name:</strong> {userData.nombre} {userData.apellido}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                </div>
              </div>

              <div className="profile-section">
                <h2>Account Settings</h2>
                <button
                    className="change-password-button"
                    onClick={() => {
                      console.log("🟡 Botón 'Change Password' clickeado");
                      setShowChangePassword(true);
                      navigate('/ChangePassword');
                    }}
                >
                  <FaLock /> Change Password
                </button>

              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Profile;
