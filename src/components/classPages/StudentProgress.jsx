import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentProgress() {
    const { studentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const teacherId = new URLSearchParams(location.search).get('teacher');

    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Загружаем данные студента
                const studentResponse = await axios.get(
                    `http://localhost:5000/api/users/${studentId}`
                );
                setStudentData(studentResponse.data);

                // Загружаем прогресс
                const progressResponse = await axios.get(
                    `http://localhost:5000/api/students/${studentId}/progress`,
                    {
                        params: { teacher_id: teacherId },
                        transformResponse: [data => {
                            console.log('Ответ сервера:', data); // Логирование
                            return JSON.parse(data);
                        }]
                    }
                );

                console.log('Полученные данные прогресса:', progressResponse.data); // Логирование
                setProgress(progressResponse.data);
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError(err.response?.data?.error || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        if (teacherId) fetchData();
    }, [studentId, teacherId]);

    if (loading) return <div className="card">Загрузка данных...</div>;
    if (error) return <div className="card error">{error}</div>;

    return (
        <div className="card profile-container">
            <button onClick={() => navigate(-1)} className="button">
                ← Назад
            </button>

            <h2>Прогресс студента</h2>

            {studentData && (
                <div className="student-info">
                    <h3>{studentData.username}</h3>
                    <p>ID: {studentData.id}</p>
                </div>
            )}

            <div className="progress-list">
                <h3>Пройденные уроки ({progress.length})</h3>

                {progress.length === 0 ? (
                    <p>Нет данных о пройденных уроках</p>
                ) : (
                    <div className="debug-data" style={{ display: 'none' }}>
                        {JSON.stringify(progress, null, 2)}
                    </div>
                )}

                {progress.map(item => (
                    <div key={item.id} className="lesson-card">
                        <h4>{item.lesson_description || 'Урок без названия'}</h4>
                        <p><strong>Курс:</strong> {item.course_name}</p>
                        <p><strong>Баллы:</strong> {item.current_score}</p>
                        <p><strong>Дата:</strong> {new Date(item.execution_date).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}