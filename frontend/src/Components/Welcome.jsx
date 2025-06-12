import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';
import '../css/Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="logo-container">
        <FaCar size={48} className="logo-icon" />
        <h1>DriveIn</h1>
      </div>
      <p className="welcome-text">Welcome to DriveIn - Your smart parking solution!</p>
      <div className="button-group">
        <button className="Button1" onClick={() => navigate('/login')}>Login</button>
        <button  className="Button1" onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
};

export default Welcome;
