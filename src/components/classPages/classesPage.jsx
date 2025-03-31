import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import TeacherClassList from "./TeacherClassList";
import JoinClassForm from "./JoinClassForm";

export default function ClassesPage({ user }) {
    const [studentClasses, setStudentClasses] = useState([]);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Загружаем классы, где пользователь студент
                const studentResponse = await axios.get(
                    `http://localhost:5000/api/data/${user.id}/classes`
                );
                setStudentClasses(studentResponse.data);

                // Если пользователь преподаватель, загружаем его классы
                if (user.role === 'teacher') {
                    const teacherResponse = await axios.get(
                        `http://localhost:5000/api/teacher/${user.id}/classes`
                    );
                    setTeacherClasses(teacherResponse.data);
                }
            } catch (err) {
                console.error('Ошибка загрузки классов:', err);
                setError('Не удалось загрузить данные классов');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, user.role]);

    // Обработчик создания нового класса
    const handleClassCreated = (newClass) => {
        setTeacherClasses([...teacherClasses, newClass]);
    };

    if (loading) {
        return (
            <div className="card">
                <h2>Мои классы</h2>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card error">
                <h2>Мои классы</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="card">
                <h2>Мои классы</h2>

                {/* Форма вступления в класс для студентов */}
                {user.role === 'student' && (
                    <JoinClassForm studentId={user.id} />
                )}

                {/* Список классов, где пользователь студент */}
                <div className="student-classes">
                    <h3>Как студент</h3>
                    {studentClasses.length > 0 ? (
                        <div className="class-list">
                            {studentClasses.map(cls => (
                                <Link
                                    key={cls.id}
                                    to={`/classes/${cls.id}/courses`}
                                    className="class-item"
                                >
                                    <h4>{cls.name}</h4>
                                    <p>Преподаватель: {cls.username}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p>Вы не состоите ни в одном классе как студент</p>
                    )}
                </div>

                {/* Если пользователь преподаватель - показываем его классы */}
                {user.role === 'teacher' && (
                    <TeacherClassList
                        teacherId={user.id}
                        classes={teacherClasses}
                        onClassCreated={handleClassCreated}
                    />
                )}
            </div>
        </div>
    );
}