import { useEffect, useState } from "react";
import axios from "axios";

export default function ClassRequests({ teacherId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/class-requests?teacher_id=${teacherId}`
                );
                setRequests(response.data);
            } catch (err) {
                setError("Не удалось загрузить запросы");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [teacherId]);

    const handleRequest = async (requestId, action) => {
        try {
            await axios.put(`http://localhost:5000/api/class-requests/${requestId}`, {
                action
            });
            setRequests(requests.filter(req => req.id !== requestId));
        } catch (err) {
            setError("Не удалось обработать запрос");
            console.error(err);
        }
    };

    if (loading) return <div className="card">Загрузка запросов...</div>;
    if (error) return <div className="card error">{error}</div>;

    return (
        <div className="class-requests">
            <h3>Запросы на вступление</h3>
            {requests.length === 0 ? (
                <p>Нет новых запросов</p>
            ) : (
                <ul className="requests-list">
                    {requests.map(request => (
                        <li key={request.id} className="request-item">
                            <div>
                                <strong>{request.student_name}</strong> хочет вступить в класс <strong>{request.class_name}</strong>
                            </div>
                            <div className="request-actions">
                                <button
                                    onClick={() => handleRequest(request.id, 'approve')}
                                    className="button"
                                    style={{ backgroundColor: '#4CAF50' }}
                                >
                                    Принять
                                </button>
                                <button
                                    onClick={() => handleRequest(request.id, 'reject')}
                                    className="button"
                                    style={{ backgroundColor: '#f44336' }}
                                >
                                    Отклонить
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}