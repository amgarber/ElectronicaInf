import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaBell, FaExclamationTriangle, FaKey,
  FaHome, FaList, FaUser, FaSignOutAlt, FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';
import '../css/Home.css';
import Notifications from './Notifications';
import MyAuthorizations from './MyAuthorizations';
import Incidents from './Incidents';

const API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const navigate = useNavigate();
  const [authorizations, setAuthorizations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentView === 'authorizations') {
          setAuthorizations([]); // Placeholder
        } else if (currentView === 'notifications') {
          const res = await fetch(`${API_URL}/api/notifications`);
          const text = await res.text();
          console.log("📃 Respuesta cruda:", text);
          const contentType = res.headers.get('content-type');

          if (!contentType || !contentType.includes('application/json')) {
            throw new Error("Respuesta no es JSON");
          }

          const data = await res.json();
          console.log("📥 Notificaciones cargadas:", data);

          const parsed = data.map((n, i) => ({
            id: i,
            title: n.tipo === 'ingreso' ? 'Ingreso' : 'Infracción',
            message: n.mensaje,
            date: n.fecha_hora,
          }));
          setNotifications(parsed);
        } else if (currentView === 'incidents') {
          setIncidents([]); // Placeholder
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentView]);

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    {
      icon: FaBell,
      title: 'Notifications and Notices',
      onClick: () => setCurrentView('notifications')
    },
    {
      icon: FaExclamationTriangle,
      title: 'Incidents',
      onClick: () => setCurrentView('incidents')
    },
    {
      icon: FaKey,
      title: 'Authorize Entry',
      onClick: () => navigate('/authorize-entry')
    }
  ];

  const navItems = [
    {
      icon: FaHome,
      title: 'Home',
      onClick: () => setCurrentView('home')
    },
    {
      icon: FaList,
      title: 'My Authorizations',
      onClick: () => setCurrentView('authorizations')
    },
    {
      icon: FaUser,
      title: 'Profile',
      onClick: () => navigate('/profile')
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
            <div className="grid">
              {menuItems.map((item, index) => (
                  <button key={index} className="grid-button" onClick={item.onClick}>
                    {React.createElement(item.icon, { size: 32, className: "text-accent" })}
                    <span>{item.title}</span>
                  </button>
              ))}
            </div>
        );
      case 'authorizations':
        return <MyAuthorizations onBack={() => setCurrentView('home')} />;

      case 'notifications':
        return <Notifications onBack={() => setCurrentView('home')} />;


      case 'incidents':
        return <Incidents onBack={() => setCurrentView('home')} />;
      default:
        return null;
    }
  };

  return (
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo">
              <FaCar size={24} className="text-accent" />
              <span>DriveIn</span>
            </div>
            <p className="slogan">Smart access, simple movement!</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </header>

        <main className="main">
          {renderContent()}
        </main>

        <nav className="bottom-nav">
          {navItems.map((item, index) => (
              <button
                  key={index}
                  className={`nav-button ${currentView === 'authorizations' && item.title === 'My Authorizations' ? 'active' : ''}`}
                  onClick={item.onClick}
              >
                {React.createElement(item.icon, { size: 20 })}
                <span>{item.title}</span>
              </button>
          ))}
        </nav>
      </div>
  );
};

export default Home;
