import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TeacherPanel({ user }) {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('createCourse');

    const [courseForm, setCourseForm] = useState({
        name: '',
        categoryId: ''
    });

    const [lessonForm, setLessonForm] = useState({
        courseId: '',
        lessonId: '',
        description: '',
        order: 1,
        question: '',
        text: '',
        options: ['', '', '', ''],
        answer: 0,
        score: 5
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'teacher') {
            navigate('/');
            return;
        }

        // Загрузка категорий
        axios.get('http://localhost:5000/api/data/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error('Error loading categories:', err));

        // Загрузка курсов преподавателя
        loadTeacherCourses();
    }, [user, navigate]);

    const loadTeacherCourses = () => {
        axios.get(`http://localhost:5000/api/data/${user.id}/courses`)
            .then(res => {
                setCourses(res.data);
                if (res.data.length > 0 && !lessonForm.courseId) {
                    setLessonForm(prev => ({
                        ...prev,
                        courseId: res.data[0].id
                    }));
                }
            })
            .catch(err => console.error('Error loading courses:', err));
    };

    useEffect(() => {
        if (lessonForm.courseId) {
            axios.get(`http://localhost:5000/api/data/courses/${lessonForm.courseId}/lessons`)
                .then(res => setLessons(res.data))
                .catch(err => console.error('Error loading lessons:', err));
        }
    }, [lessonForm.courseId]);

    useEffect(() => {
        if (lessonForm.lessonId) {
            axios.get(`http://localhost:5000/api/data/${lessonForm.lessonId}/questions`)
                .then(res => setTasks(res.data))
                .catch(err => console.error('Error loading tasks:', err));
        }
    }, [lessonForm.lessonId]);

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourseForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleLessonChange = (e) => {
        const { name, value } = e.target;
        setLessonForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...lessonForm.options];
        newOptions[index] = value;
        setLessonForm(prev => ({ ...prev, options: newOptions }));
        setErrors(prev => ({ ...prev, options: '' }));
    };

    const validateCourseForm = () => {
        const newErrors = {};
        if (!courseForm.name) newErrors.name = 'Введите название курса';
        if (!courseForm.categoryId) newErrors.categoryId = 'Выберите категорию';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateLessonForm = () => {
        const newErrors = {};
        if (!lessonForm.courseId) newErrors.courseId = 'Выберите курс';
        if (!lessonForm.description) newErrors.description = 'Введите описание урока';
        if (!lessonForm.question) newErrors.question = 'Введите вопрос';
        if (lessonForm.options.some(opt => !opt)) newErrors.options = 'Заполните все варианты ответов';
        if (lessonForm.answer < 0 || lessonForm.answer > 3) newErrors.answer = 'Выберите правильный ответ';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitCourse = async (e) => {
        e.preventDefault();
        if (!validateCourseForm()) return;

        try {
            await axios.post('http://localhost:5000/api/courses', {
                name: courseForm.name,
                teacher_id: user.id,
                category_id: courseForm.categoryId
            });

            setSuccessMessage('Курс успешно создан!');
            setCourseForm({ name: '', categoryId: '' });
            loadTeacherCourses();
            setActiveTab('createLesson');
        } catch (error) {
            setErrors({ form: 'Ошибка при создании курса' });
        }
    };

    const handleSubmitLesson = async (e) => {
        e.preventDefault();
        // if (!validateLessonForm()) return console.log(" no valid");

        try {
            const response = await axios.post('http://localhost:5000/api/lessons', {
                description: lessonForm.description,
                course_id: lessonForm.courseId,
                order: lessonForm.order
            });

            setLessonForm(prev => ({ ...prev, lessonId: response.data.id }));
            setSuccessMessage('Урок успешно создан!');
        } catch (error) {
            setErrors({ form: 'Ошибка при создании урока' });
        }
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        if (!validateLessonForm() || !lessonForm.lessonId) {
            setErrors({ form: 'Сначала создайте урок' });
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/tasks', {
                lesson_id: lessonForm.lessonId,
                question: lessonForm.question,
                text: lessonForm.text,
                options: lessonForm.options,
                answer: lessonForm.answer,
                score: lessonForm.score
            });

            setSuccessMessage('Задание успешно добавлено!');
            const res = await axios.get(`http://localhost:5000/api/data/${lessonForm.lessonId}/questions`);
            setTasks(res.data);
            setLessonForm(prev => ({
                ...prev,
                question: '',
                text: '',
                options: ['', '', '', ''],
                answer: 0,
                score: 5
            }));
        } catch (error) {
            setErrors({ form: 'Ошибка при создании задания' });
        }
    };

    return (
        <div className="container">
            <div className="card form-container">
                <h2>Панель преподавателя</h2>

                <div className="flex-center" style={{ marginBottom: '20px' }}>
                    <button
                        className={`li-element ${activeTab === 'createCourse' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('createCourse')}
                    >
                        Создать курс
                    </button>
                    <button
                        className={`li-element ${activeTab === 'createLesson' ? 'selected' : ''}`}
                        onClick={() => setActiveTab('createLesson')}
                    >
                        Создать урок
                    </button>
                </div>

                {errors.form && <div className="error-message">{errors.form}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {activeTab === 'createCourse' && (
                    <form onSubmit={handleSubmitCourse} className="margin">
                        <h3>Создание нового курса</h3>

                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Название курса"
                                value={courseForm.name}
                                onChange={handleCourseChange}
                                className={errors.name ? 'input-error' : ''}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div>
                            <select
                                name="categoryId"
                                value={courseForm.categoryId}
                                onChange={handleCourseChange}
                                className={errors.categoryId ? 'input-error' : ''}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
                        </div>

                        <button type="submit" className="button">
                            Создать курс
                        </button>
                    </form>
                )}

                {activeTab === 'createLesson' && (
                    <>
                        <div className="margin">
                            <h3>1. Выберите курс</h3>
                            {courses.length === 0 ? (
                                <div className="error-message">
                                    У вас нет созданных курсов. Пожалуйста, сначала создайте курс.
                                </div>
                            ) : (
                                <select
                                    name="courseId"
                                    value={lessonForm.courseId}
                                    onChange={handleLessonChange}
                                    className={errors.courseId ? 'input-error' : ''}
                                >
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name} (Категория: {course.category_title || 'неизвестно'})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.courseId && <div className="error-message">{errors.courseId}</div>}
                        </div>

                        {lessonForm.courseId && (
                            <>
                                <form onSubmit={handleSubmitLesson}>
                                    <h3>2. Создайте урок</h3>
                                    <div>
                                        <input
                                            type="text"
                                            name="description"
                                            placeholder="Описание урока"
                                            value={lessonForm.description}
                                            onChange={handleLessonChange}
                                            className={errors.description ? 'input-error' : ''}
                                        />
                                        {errors.description && <div className="error-message">{errors.description}</div>}
                                    </div>

                                    <div>
                                        <label>
                                            Порядковый номер:
                                            <input
                                                type="number"
                                                name="order"
                                                value={lessonForm.order}
                                                onChange={handleLessonChange}
                                                min="1"
                                                style={{ marginLeft: '10px' }}
                                            />
                                        </label>
                                    </div>

                                    <button type="submit" className="button">
                                        Создать урок
                                    </button>
                                </form>

                                {lessonForm.lessonId && (
                                    <form onSubmit={handleSubmitTask} className="margin">
                                        <h3>3. Добавьте задание</h3>

                                        <div>
                                            <input
                                                type="text"
                                                name="question"
                                                placeholder="Вопрос"
                                                value={lessonForm.question}
                                                onChange={handleLessonChange}
                                                className={errors.question ? 'input-error' : ''}
                                            />
                                            {errors.question && <div className="error-message">{errors.question}</div>}
                                        </div>

                                        <div>
                                            <textarea
                                                name="text"
                                                placeholder="Дополнительный текст (необязательно)"
                                                value={lessonForm.text}
                                                onChange={handleLessonChange}
                                                rows="3"
                                                style={{ width: '100%', margin: '10px 0' }}
                                            />
                                        </div>

                                        <h4>Варианты ответов:</h4>
                                        {lessonForm.options.map((option, index) => (
                                            <div key={index}>
                                                <input
                                                    type="text"
                                                    placeholder={`Вариант ${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    className={errors.options ? 'input-error' : ''}
                                                />
                                            </div>
                                        ))}
                                        {errors.options && <div className="error-message">{errors.options}</div>}

                                        <div>
                                            <h4>Правильный ответ:</h4>
                                            <select
                                                name="answer"
                                                value={lessonForm.answer}
                                                onChange={handleLessonChange}
                                                className={errors.answer ? 'input-error' : ''}
                                            >
                                                {lessonForm.options.map((_, index) => (
                                                    <option key={index} value={index}>
                                                        Вариант {index + 1}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.answer && <div className="error-message">{errors.answer}</div>}
                                        </div>

                                        <div>
                                            <label>
                                                Баллы за задание:
                                                <input
                                                    type="number"
                                                    name="score"
                                                    value={lessonForm.score}
                                                    onChange={handleLessonChange}
                                                    min="1"
                                                    style={{ marginLeft: '10px' }}
                                                />
                                            </label>
                                        </div>

                                        <button type="submit" className="button">
                                            Добавить задание
                                        </button>
                                    </form>
                                )}

                                {tasks.length > 0 && (
                                    <div className="margin">
                                        <h3>Задания в этом уроке:</h3>
                                        <ul className="notDot">
                                            {tasks.map(task => {
                                                try {
                                                    // Пытаемся разобрать options как JSON
                                                    const options = typeof task.options === 'string'
                                                        ? JSON.parse(task.options)
                                                        : task.options;

                                                    return (
                                                        <li key={task.id} className="card" style={{ marginBottom: '10px' }}>
                                                            <h4>{task.question}</h4>
                                                            {task.text && <p>{task.text}</p>}
                                                            <ul>
                                                                {options.map((option, i) => (
                                                                    <li key={i} style={{
                                                                        color: i === task.answer ? '#80FF00' : 'white',
                                                                        fontWeight: i === task.answer ? 'bold' : 'normal'
                                                                    }}>
                                                                        {option}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <p>Баллы: {task.score}</p>
                                                        </li>
                                                    );
                                                } catch (e) {
                                                    console.error('Error parsing options:', e);
                                                    return null;
                                                }
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default TeacherPanel;