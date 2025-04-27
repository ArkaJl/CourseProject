import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CourseManagementPage({ user }) {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState({
        courses: false,
        tasks: false,
        deleting: false
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Загрузка курсов преподавателя
    useEffect(() => {
        if (user?.role !== 'teacher') {
            navigate('/');
            return;
        }

        const loadCourses = async () => {
            setLoading(prev => ({ ...prev, courses: true }));
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/api/teacher-courses/${user.id}`);
                setCourses(response.data);
            } catch (err) {
                setError('Не удалось загрузить курсы');
                console.error('Error loading courses:', err);
            } finally {
                setLoading(prev => ({ ...prev, courses: false }));
            }
        };

        loadCourses();
    }, [user, navigate]);

    // Загрузка заданий при выборе урока
    useEffect(() => {
        if (!selectedLesson) {
            setTasks([]);
            return;
        }

        const loadTasks = async () => {
            setLoading(prev => ({ ...prev, tasks: true }));
            setError('');

            try {
                const response = await axios.get(
                    `http://localhost:5000/api/lesson-tasks/${selectedLesson.id}`
                );

                // Дополнительная проверка данных
                const validTasks = response.data.map(task => ({
                    ...task,
                    options: Array.isArray(task.options) ? task.options : [],
                    answer: Number.isInteger(task.answer) ? task.answer : 0,
                    score: Number.isInteger(task.score) ? task.score : 0
                }));

                setTasks(validTasks);
            } catch (err) {
                setError('Не удалось загрузить задания урока');
                console.error('Error loading tasks:', err);
                setTasks([]); // Сбрасываем задания при ошибке
            } finally {
                setLoading(prev => ({ ...prev, tasks: false }));
            }
        };

        loadTasks();
    }, [selectedLesson]);

    // удаление
    const handleDelete = async (type, id) => {
        if (!window.confirm(`Удалить ${type}?`)) return;

        setLoading({ ...loading, deleting: true });

        try {
            await axios.delete(`http://localhost:5000/api/${type}s/${id}`);

            // Обновление состояния
            if (type === 'course') {
                setCourses(courses.filter(c => c.id !== id));
                if (selectedCourse?.id === id) setSelectedCourse(null);
            }
            else if (type === 'lesson') {
                const updatedCourses = courses.map(course => ({
                    ...course,
                    lessons: course.lessons.filter(l => l.id !== id),
                }));
                setCourses(updatedCourses);
                if (selectedLesson?.id === id) setSelectedLesson(null);
            }
            else if (type === 'task') {
                setTasks(tasks.filter(t => t.id !== id));
            }

            alert(`Успешно удалено!`);
        } catch (err) {
            setError(`Ошибка: ${err.message}`);
        } finally {
            setLoading({ ...loading, deleting: false });
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h2>Управление курсами</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="management-grid">
                    {/* Колонка курсов */}
                    <div className="management-column">
                        <h3>Ваши курсы</h3>
                        {loading.courses ? (
                            <p>Загрузка курсов...</p>
                        ) : courses.length === 0 ? (
                            <p>Нет доступных курсов</p>
                        ) : (
                            <ul className="course-list">
                                {courses.map(course => (
                                    <li
                                        key={course.id}
                                        className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setSelectedLesson(null);
                                        }}
                                    >
                                        <div className="course-header">
                                            <h4>{course.name}</h4>
                                            <span className="category-badge">
                                                {course.category_name || 'Без категории'}
                                            </span>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete('course', course.id);
                                            }}
                                            disabled={loading.deleting}
                                        >
                                            Удалить
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Колонка уроков */}
                    <div className="management-column">
                        <h3>Уроки курса</h3>
                        {!selectedCourse ? (
                            <p>Выберите курс</p>
                        ) : loading.courses ? (
                            <p>Загрузка уроков...</p>
                        ) : selectedCourse.lessons.length === 0 ? (
                            <p>В этом курсе нет уроков</p>
                        ) : (
                            <ul className="lesson-list">
                                {selectedCourse.lessons.map(lesson => (
                                    <li
                                        key={lesson.id}
                                        className={`lesson-item ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedLesson(lesson)}
                                    >
                                        <div>
                                            <h4>{lesson.description}</h4>
                                            <p>Порядок: {lesson.order}</p>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete('lesson', lesson.id);
                                            }}
                                            disabled={loading.deleting}
                                        >
                                            Удалить
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Колонка заданий */}
                    <div className="management-column">
                        <h3>Задания урока</h3>
                        {loading.tasks ? (
                            <p>Загрузка заданий...</p>
                        ) : error ? (
                            <div className="error-message">
                                {error}
                                <button
                                    onClick={() => {
                                        setError('');
                                        // Повторная попытка загрузки
                                        const loadTasks = async () => { /* ... */ };
                                        loadTasks();
                                    }}
                                    className="retry-btn"
                                >
                                    Повторить попытку
                                </button>
                            </div>
                        ) : tasks.length === 0 ? (
                            <p>В этом уроке нет заданий</p>
                        ) : (
                            <ul className="task-list">
                                {tasks.map((task, index) => (
                                    <TaskItem
                                        key={task.id || index}
                                        task={task}
                                        onDelete={() => handleDelete('task', task.id)}
                                        loading={loading.deleting}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskItem({ task, onDelete, loading }) {
    return (
        <li className="task-item">
            <div className="task-content">
                <h4>{task.question || 'Без названия'}</h4>
                {task.text && <p className="task-text">{task.text}</p>}

                {Array.isArray(task.options) && task.options.length > 0 ? (
                    <ul className="options-list">
                        {task.options.map((option, i) => (
                            <li
                                key={i}
                                className={i === task.answer ? 'correct-answer' : ''}
                            >
                                {option || `Вариант ${i + 1}`}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Нет вариантов ответа</p>
                )}

                <p className="task-score">
                    Баллы: {Number.isInteger(task.score) ? task.score : 0}
                </p>
            </div>
            <button
                className="delete-btn"
                onClick={onDelete}
                disabled={loading}
            >
                {loading ? 'Удаление...' : 'Удалить'}
            </button>
        </li>
    );
}

export default CourseManagementPage;