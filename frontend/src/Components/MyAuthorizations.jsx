import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const MyAuthorizations = ({ onBack }) => {
    const [authorizations, setAuthorizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAuthorizations = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No hay sesión activa');

                const res = await fetch(`${API_URL}/api/my-authorizations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Error al obtener autorizaciones');
                }

                const parsed = data.map((auth) => ({
                    id: auth.id,
                    firstName: auth.firstname,
                    lastName: auth.lastname,
                    licensePlate: auth.licenseplate
                }));


                setAuthorizations(parsed);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorizations();
    }, []);

    return (
        <div className="authorizations-section">
            <div className="section-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back
                </button>
                <h2>My Authorizations</h2>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : authorizations.length === 0 ? (
                <div className="no-authorizations">
                    <FaCheckCircle className="no-auth-icon" />
                    <p>You haven't authorized any entries yet.</p>
                </div>
            ) : (
                <div className="authorizations-list">
                    {authorizations.map((auth) => (
                        <div key={auth.id} className="authorization-card">
                            <div className="auth-info">
                                <h3>{auth.firstName} {auth.lastName}</h3>
                                <p className="license-plate">{auth.licensePlate}</p>
                                <p className="date">Authorized entry</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAuthorizations;
