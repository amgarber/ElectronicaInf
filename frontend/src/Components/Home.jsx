import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar, FaBell, FaExclamationTriangle, FaKey, 
  FaHome, FaList, FaUser, FaSignOutAlt, FaCheckCircle 
} from 'react-icons/fa';
import '../css/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [authorizations, setAuthorizations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentView === 'authorizations') {
          setAuthorizations([]); // Simular fetch
        } else if (currentView === 'notifications') {
          setNotifications([]); // Simular fetch
        } else if (currentView === 'incidents') {
          setIncidents([]); // Simular fetch
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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
              <button 
                key={index} 
                className="grid-button"
                onClick={item.onClick}
              >
                {React.createElement(item.icon, { size: 32, className: "text-accent" })}
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        );
      case 'authorizations':
        return (
          <div className="authorizations-section">
            <h2>My Authorizations</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : authorizations.length === 0 ? (
              <div className="no-authorizations">
                <FaCheckCircle className="no-auth-icon" />
                <p>You haven't authorized any entries yet.</p>
                <button 
                  className="authorize-button"
                  onClick={() => navigate('/authorize-entry')}
                >
                  Authorize Entry
                </button>
              </div>
            ) : (
              <div className="authorizations-list">
                {authorizations.map((auth) => (
                  <div key={auth.id} className="authorization-card">
                    <div className="auth-info">
                      <h3>{auth.firstName} {auth.lastName}</h3>
                      <p className="license-plate">{auth.licensePlate}</p>
                      <p className="date">Authorized on: {new Date(auth.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="notifications-section">
            <h2>Notifications and Notices</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <FaBell className="no-notification-icon" />
                <p>You don't have any notifications yet.</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-card">
                    <div className="notification-info">
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <p className="date">{new Date(notification.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'incidents':
        return (
          <div className="incidents-section">
            <h2>Incidents</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : incidents.length === 0 ? (
              <div className="no-incidents">
                <FaExclamationTriangle className="no-incident-icon" />
                <p>No incidents reported.</p>
              </div>
            ) : (
              <div className="incidents-list">
                {incidents.map((incident) => (
                  <div key={incident.id} className="incident-card">
                    <div className="incident-info">
                      <h3>{incident.type}</h3>
                      <p>{incident.description}</p>
                      <div className="incident-details">
                        <span className={`status ${incident.status.toLowerCase()}`}>
                          {incident.status}
                        </span>
                        <span className="date">{new Date(incident.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
          <p className="slogan">Your smart parking solution</p>
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
