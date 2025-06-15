import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import '../css/Incidents.css';

const API_URL = process.env.REACT_APP_API_URL;

const Incidents = ({ onBack }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await fetch(`${API_URL}/api/infracciones`);
                const data = await res.json();
                const parsed = data.map((incident) => ({
                    id: incident.id,
                    patente: incident.patente,
                    description: incident.descripcion,
                    date: incident.fecha_hora,
                }));
                setIncidents(parsed);
            } catch (error) {
                console.error('Error fetching incidents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    return (
        <div className="incidents-section">
            <div className="section-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back
                </button>
                <h2>Incidents</h2>
            </div>

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
                                <h3>Infracción: {incident.patente}</h3>
                                <p>{incident.description}</p>
                                <div className="incident-details">
                                    <span className="date">{new Date(incident.date).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Incidents;
