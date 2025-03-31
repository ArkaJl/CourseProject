import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ClassRequests from "./ClassRequests";
import CreateClassForm from "./CreateClassForm";

export default function TeacherClassList({ teacherId }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [showRequests, setShowRequests] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/teacher/${teacherId}/classes`
                );
                setClasses(response.data);
            } catch (err) {
                setError('Не удалось загрузить классы');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [teacherId]);

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClassCreated = (newClass) => {
        setClasses([...classes, newClass]);
        setShowCreateForm(false);
    };

    if (loading) return <div className="card">Загрузка классов...</div>;
    if (error) return <div className="card error">{error}</div>;

    return (
        <div className="teacher-classes">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Мои классы</h2>
                <div className="flex" style={{ gap: '10px' }}>
                    <button
                        onClick={() => setShowRequests(!showRequests)}
                        className="button"
                    >
                        {showRequests ? 'Скрыть запросы' : 'Показать запросы'}
                    </button>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="button"
                    >
                        {showCreateForm ? 'Отмена' : 'Создать класс'}
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <CreateClassForm
                        teacherId={teacherId}
                        onClassCreated={handleClassCreated}
                    />
                </div>
            )}

            {showRequests && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <ClassRequests teacherId={teacherId} />
                </div>
            )}

            <div className="class-list">
                {classes.length === 0 ? (
                    <div className="card">
                        <p>У вас пока нет классов</p>
                    </div>
                ) : (
                    classes.map(cls => (
                        <div key={cls.id} className="card class-item">
                            <div className="flex-center">
                                <h3>{cls.name}</h3>
                                <button
                                    onClick={() => copyToClipboard(cls.id)}
                                    className="copy-id-btn"
                                >
                                    {copiedId === cls.id ? '✓ Скопировано' : 'Копировать ID'}
                                </button>
                            </div>
                            <p>ID класса: <strong>{cls.id}</strong></p>
                            <p>Учеников: {cls.student_count || 0}</p>
                            <div className="flex" style={{ gap: '10px', marginTop: '10px' }}>
                                <Link
                                    to={`/teacher/classes/${cls.id}/students`}
                                    className="link li-element"
                                >
                                    Управление классом
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}