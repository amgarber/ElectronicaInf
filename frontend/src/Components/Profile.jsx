import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaCar, FaExclamationTriangle } from 'react-icons/fa';
import '../css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // 🔧 Reemplazá estos datos por los que obtengas del backend en Node.js más adelante
  const userData = {
    licensePlate: 'ABC123',
    fines: 2
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
          <h1>Profile</h1>
        </div>
      </header>

      <main className="main">
        <div className="profile-container">
          <div className="profile-section">
            <h2>Vehicle Information</h2>
            <div className="info-card">
              <div className="info-item">
                <FaCar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">License Plate</span>
                  <span className="info-value">{userData.licensePlate}</span>
                </div>
              </div>
              <div className="info-item">
                <FaExclamationTriangle className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Active Fines</span>
                  <span className="info-value">{userData.fines}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Account Settings</h2>
            <button
              className="change-password-button"
              onClick={() => console.log('Change password clicked')}
            >
              <FaLock /> Change Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
