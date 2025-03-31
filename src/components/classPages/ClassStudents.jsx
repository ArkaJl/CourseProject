import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function ClassStudents() {
    const { classId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Сначала получаем информацию о классе, чтобы узнать teacher_id
                const classResponse = await axios.get(
                    `http://localhost:5000/api/classes/${classId}`
                );
                setClassInfo(classResponse.data);

                // Затем получаем студентов класса
                await fetchStudents();
            } catch (err) {
                setError('Не удалось загрузить данные');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classId]);

    const fetchStudents = async () => {
        try {
            const studentsResponse = await axios.get(
                `http://localhost:5000/api/classes/${classId}/students`
            );
            setStudents(studentsResponse.data);
        } catch (err) {
            setError('Не удалось загрузить список студентов');
            console.error(err);
        }
    };

    const removeStudent = async (studentId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого студента из класса?')) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/api/classes/${classId}/students/${studentId}`
            );
            setSuccessMessage('Студент успешно удален из класса');
            await fetchStudents(); // Обновляем список студентов
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Не удалось удалить студента');
            console.error(err);
        }
    };

    if (loading) return <div className="card">Загрузка...</div>;
    if (error) return <div className="card error">{error}</div>;

    return (
        <div className="card profile-container">
            <h2>Студенты класса {classInfo?.name}</h2>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <div className="class-list">
                {students.map(student => (
                    <div key={student.id} className="li-element notDot">
                        <Link
                            to={`/teacher/students/${student.id}/progress?teacher=${classInfo.teacher_id}`}
                            className="flex-center"
                            style={{ flex: 2, textDecoration: 'none', color: 'white' }}
                        >
                            <h3 className="padding-left-right">{student.username}</h3>
                            <p className="padding-left-right">Пройдено уроков: {student.completed_lessons || 0}</p>
                        </Link>
                        <button
                            onClick={() => removeStudent(student.id)}
                            className="delete-btn"
                            style={{ margin: '10px' }}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}