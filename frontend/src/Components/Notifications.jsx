import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaBell } from 'react-icons/fa';
import '../css/Notifications.css';

const API_URL = process.env.REACT_APP_API_URL;
console.log("🔍 API_URL desde Notifications.jsx:", API_URL);

const Notifications = ({ onBack }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedImageIds, setExpandedImageIds] = useState([]);
    const [lastResponse, setLastResponse] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_URL}/api/notifications`);
                const data = await res.json();

                const parsed = data.map((n, i) => ({
                    id: n.id ?? i,
                    title:
                        n.tipo === 'ingreso'
                            ? 'Ingreso'
                            : n.tipo === 'infraccion'
                                ? 'Infracción'
                                : 'Solicitud de Ingreso',
                    message: n.mensaje,
                    date: n.fecha_hora,
                    imageUrl: n.imagen_url,
                    tipo: n.tipo,
                    patente: n.mensaje.match(/[A-Z0-9]{6,8}/)?.[0] || '',
                }));
                setNotifications(parsed);
            } catch (err) {
                console.error('Error al obtener notificaciones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const toggleImage = (id) => {
        setExpandedImageIds((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );
    };

    const responderSolicitud = async (id, respuesta) => {
        try {
            console.log(`📤 Enviando solicitud (${respuesta}) para ID:`, id);

            const res = await fetch(`${API_URL}/api/responder-solicitud`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, respuesta }),
            });

            const data = await res.json();
            console.log("📥 Respuesta del backend:", data);
            setLastResponse(data.message);

            setNotifications((prev) =>
                prev.filter((n) => !(n.tipo === 'solicitud_manual' && n.id === id))
            );
        } catch (err) {
            console.error('❌ Error al responder solicitud:', err);
            setLastResponse('❌ Error al responder solicitud');
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http')
            ? url
            : `https://esp32-captures.s3.amazonaws.com/${url}`;
    };

    return (
        <div className="notifications-section">
            <div className="section-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back
                </button>
                <h2>Notifications and Notices</h2>
            </div>

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
                        <div
                            key={`${notification.id}-${notification.tipo}`}
                            className="notification-card"
                        >
                            <div className="notification-info">
                                <h3>{notification.title}</h3>
                                <p>
                                    {notification.message}
                                    {notification.imageUrl && (
                                        <>
                                            {' · '}
                                            <button
                                                className="inline-link-button"
                                                onClick={() => toggleImage(notification.id)}
                                            >
                                                {expandedImageIds.includes(notification.id)
                                                    ? 'Ocultar imagen'
                                                    : 'Ver imagen'}
                                            </button>
                                        </>
                                    )}
                                </p>
                                <p className="date">
                                    {new Date(notification.date).toLocaleString()}
                                </p>

                                {expandedImageIds.includes(notification.id) &&
                                    notification.imageUrl && (
                                        <img
                                            src={getFullImageUrl(notification.imageUrl)}
                                            alt="Imagen adjunta"
                                            className="notification-image"
                                        />
                                    )}

                                {notification.tipo === 'solicitud_manual' && (
                                    <div className="action-buttons">
                                        <button
                                            className="accept-button"
                                            onClick={() =>
                                                responderSolicitud(notification.id, 'autorizado')
                                            }
                                        >
                                            Permitir ingreso
                                        </button>
                                        <button
                                            className="deny-button"
                                            onClick={() =>
                                                responderSolicitud(notification.id, 'denegado')
                                            }
                                        >
                                            Denegar ingreso
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
