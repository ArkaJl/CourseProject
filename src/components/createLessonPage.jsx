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
            <div className="card" style={{
                padding: '25px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '30px',
                    borderBottom: '1px solid rgba(128, 255, 0, 0.3)',
                    paddingBottom: '15px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '28px',
                        color: '#80FF00',
                        flexGrow: 1
                    }}>
                        Панель преподавателя
                    </h2>
                    <div style={{
                        backgroundColor: 'rgba(128, 255, 0, 0.1)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontSize: '14px'
                    }}>
                        {courses.length} {courses.length % 10 === 1 ? 'курс' : courses.length % 10 < 5 ? 'курса' : 'курсов'}
                    </div>
                </div>

                {/* Основной layout */}
                <div style={{
                    display: 'flex',
                    gap: '25px',
                    minHeight: '600px'
                }}>
                    {/* Боковая панель */}
                    <div style={{
                        flex: '0 0 250px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <button
                            onClick={() => setActiveTab('createCourse')}
                            style={{
                                padding: '15px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'createCourse'
                                    ? 'rgba(128, 255, 0, 0.2)'
                                    : 'rgba(0, 0, 0, 0.4)',
                                color: 'white',
                                fontSize: '16px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                borderLeft: activeTab === 'createCourse' ? '4px solid #80FF00' : '4px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>+</span>
                            Новый курс
                        </button>

                        <button
                            onClick={() => setActiveTab('createLesson')}
                            disabled={courses.length === 0}
                            style={{
                                padding: '15px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'createLesson'
                                    ? 'rgba(128, 255, 0, 0.2)'
                                    : 'rgba(0, 0, 0, 0.4)',
                                color: courses.length === 0 ? '#666' : 'white',
                                fontSize: '16px',
                                cursor: courses.length === 0 ? 'not-allowed' : 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                borderLeft: activeTab === 'createLesson' ? '4px solid #80FF00' : '4px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>+</span>
                            Новый урок
                        </button>

                        {/* Список курсов */}
                        {courses.length > 0 && (
                            <div style={{
                                marginTop: '10px',
                                overflowY: 'auto',
                                maxHeight: '400px',
                                paddingRight: '5px'
                            }}>
                                <h4 style={{
                                    color: '#80FF00',
                                    marginBottom: '15px',
                                    paddingBottom: '5px',
                                    borderBottom: '1px solid rgba(128, 255, 0, 0.2)'
                                }}>
                                    Ваши курсы
                                </h4>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {courses.map(course => (
                                        <li
                                            key={course.id}
                                            onClick={() => {
                                                setActiveTab('createLesson');
                                                setLessonForm({...lessonForm, courseId: course.id});
                                            }}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '6px',
                                                background: lessonForm.courseId === course.id
                                                    ? 'rgba(128, 255, 0, 0.1)'
                                                    : 'rgba(0, 0, 0, 0.3)',
                                                border: lessonForm.courseId === course.id
                                                    ? '1px solid #80FF00'
                                                    : '1px solid rgba(128, 255, 0, 0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {course.name}
                                        </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#80FF00',
                                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                                padding: '2px 6px',
                                                borderRadius: '10px'
                                            }}>
                                            {course.lessons_count || 0} уроков
                                        </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Основное содержимое */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '25px'
                    }}>
                        {errors.form && (
                            <div style={{
                                padding: '15px',
                                background: 'rgba(255, 0, 0, 0.1)',
                                borderLeft: '4px solid #ff0000',
                                borderRadius: '4px',
                                color: '#ff6666'
                            }}>
                                {errors.form}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                padding: '15px',
                                background: 'rgba(0, 255, 0, 0.1)',
                                borderLeft: '4px solid #00ff00',
                                borderRadius: '4px',
                                color: '#80FF00'
                            }}>
                                {successMessage}
                            </div>
                        )}

                        {/* Форма создания курса */}
                        {activeTab === 'createCourse' && (
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '10px',
                                padding: '25px',
                                flex: 1
                            }}>
                                <h3 style={{
                                    marginTop: 0,
                                    marginBottom: '25px',
                                    color: '#80FF00',
                                    fontSize: '22px'
                                }}>
                                    Создание нового курса
                                </h3>

                                <form onSubmit={handleSubmitCourse} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#aaa'
                                        }}>
                                            Название курса
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Введите название курса"
                                            value={courseForm.name}
                                            onChange={handleCourseChange}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                background: 'rgba(0, 0, 0, 0.5)',
                                                border: errors.name
                                                    ? '1px solid #ff0000'
                                                    : '1px solid rgba(128, 255, 0, 0.3)',
                                                borderRadius: '6px',
                                                color: 'white',
                                                fontSize: '16px'
                                            }}
                                        />
                                        {errors.name && (
                                            <div style={{
                                                color: '#ff0000',
                                                fontSize: '14px',
                                                marginTop: '5px'
                                            }}>
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#aaa'
                                        }}>
                                            Категория
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={courseForm.categoryId}
                                            onChange={handleCourseChange}
                                            style={{
                                                width: '100%',
                                                padding: '12px 15px',
                                                background: 'rgba(0, 0, 0, 0.5)',
                                                border: errors.categoryId
                                                    ? '1px solid #ff0000'
                                                    : '1px solid rgba(128, 255, 0, 0.3)',
                                                borderRadius: '6px',
                                                color: 'white',
                                                fontSize: '16px',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && (
                                            <div style={{
                                                color: '#ff0000',
                                                fontSize: '14px',
                                                marginTop: '5px'
                                            }}>
                                                {errors.categoryId}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        style={{
                                            marginTop: '15px',
                                            padding: '14px',
                                            background: '#80FF00',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            alignSelf: 'flex-start',
                                            minWidth: '200px'
                                        }}
                                        onMouseOver={e => e.target.style.background = '#aaff33'}
                                        onMouseOut={e => e.target.style.background = '#80FF00'}
                                    >
                                        Создать курс
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Форма создания урока */}
                        {activeTab === 'createLesson' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '25px',
                                flex: 1
                            }}>
                                {courses.length === 0 ? (
                                    <div style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        borderRadius: '10px',
                                        padding: '25px',
                                        textAlign: 'center',
                                        color: '#aaa'
                                    }}>
                                        У вас пока нет курсов. Сначала создайте курс.
                                    </div>
                                ) : (
                                    <>
                                        {!lessonForm.courseId && (
                                            <div style={{
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: '10px',
                                                padding: '25px'
                                            }}>
                                                <h3 style={{
                                                    marginTop: 0,
                                                    marginBottom: '20px',
                                                    color: '#80FF00',
                                                    fontSize: '22px'
                                                }}>
                                                    Выберите курс для добавления урока
                                                </h3>
                                                <p style={{ color: '#aaa' }}>
                                                    Нажмите на курс в списке слева или выберите из списка ниже:
                                                </p>

                                                <select
                                                    name="courseId"
                                                    value={lessonForm.courseId}
                                                    onChange={handleLessonChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 15px',
                                                        marginTop: '15px',
                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                        border: '1px solid rgba(128, 255, 0, 0.3)',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        fontSize: '16px',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    <option value="">Выберите курс</option>
                                                    {courses.map(course => (
                                                        <option key={course.id} value={course.id}>
                                                            {course.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {lessonForm.courseId && (
                                            <>
                                                <div style={{
                                                    background: 'rgba(0, 0, 0, 0.3)',
                                                    borderRadius: '10px',
                                                    padding: '25px'
                                                }}>
                                                    <h3 style={{
                                                        marginTop: 0,
                                                        marginBottom: '20px',
                                                        color: '#80FF00',
                                                        fontSize: '22px'
                                                    }}>
                                                        Создание нового урока
                                                    </h3>

                                                    <form onSubmit={handleSubmitLesson} style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '20px'
                                                    }}>
                                                        <div>
                                                            <label style={{
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                color: '#aaa'
                                                            }}>
                                                                Описание урока
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="description"
                                                                placeholder="Введите описание урока"
                                                                value={lessonForm.description}
                                                                onChange={handleLessonChange}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '12px 15px',
                                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                                    border: errors.description
                                                                        ? '1px solid #ff0000'
                                                                        : '1px solid rgba(128, 255, 0, 0.3)',
                                                                    borderRadius: '6px',
                                                                    color: 'white',
                                                                    fontSize: '16px'
                                                                }}
                                                            />
                                                            {errors.description && (
                                                                <div style={{
                                                                    color: '#ff0000',
                                                                    fontSize: '14px',
                                                                    marginTop: '5px'
                                                                }}>
                                                                    {errors.description}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label style={{
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                color: '#aaa'
                                                            }}>
                                                                Порядковый номер урока
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="order"
                                                                value={lessonForm.order}
                                                                onChange={handleLessonChange}
                                                                min="1"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '12px 15px',
                                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                                    border: '1px solid rgba(128, 255, 0, 0.3)',
                                                                    borderRadius: '6px',
                                                                    color: 'white',
                                                                    fontSize: '16px'
                                                                }}
                                                            />
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            style={{
                                                                marginTop: '15px',
                                                                padding: '14px',
                                                                background: '#80FF00',
                                                                color: '#000',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '16px',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                transition: 'background 0.2s',
                                                                alignSelf: 'flex-start',
                                                                minWidth: '200px'
                                                            }}
                                                            onMouseOver={e => e.target.style.background = '#aaff33'}
                                                            onMouseOut={e => e.target.style.background = '#80FF00'}
                                                        >
                                                            Создать урок
                                                        </button>
                                                    </form>
                                                </div>

                                                {lessonForm.lessonId && (
                                                    <div style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        borderRadius: '10px',
                                                        padding: '25px'
                                                    }}>
                                                        <h3 style={{
                                                            marginTop: 0,
                                                            marginBottom: '20px',
                                                            color: '#80FF00',
                                                            fontSize: '22px'
                                                        }}>
                                                            Добавление задания к уроку
                                                        </h3>

                                                        <form onSubmit={handleSubmitTask} style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '20px'
                                                        }}>
                                                            <div>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    color: '#aaa'
                                                                }}>
                                                                    Вопрос задания
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="question"
                                                                    placeholder="Введите вопрос"
                                                                    value={lessonForm.question}
                                                                    onChange={handleLessonChange}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '12px 15px',
                                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                                        border: errors.question
                                                                            ? '1px solid #ff0000'
                                                                            : '1px solid rgba(128, 255, 0, 0.3)',
                                                                        borderRadius: '6px',
                                                                        color: 'white',
                                                                        fontSize: '16px'
                                                                    }}
                                                                />
                                                                {errors.question && (
                                                                    <div style={{
                                                                        color: '#ff0000',
                                                                        fontSize: '14px',
                                                                        marginTop: '5px'
                                                                    }}>
                                                                        {errors.question}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    color: '#aaa'
                                                                }}>
                                                                    Варианты ответов
                                                                </label>
                                                                {lessonForm.options.map((option, index) => (
                                                                    <div key={index} style={{ marginBottom: '10px' }}>
                                                                        <input
                                                                            type="text"
                                                                            placeholder={`Вариант ответа ${index + 1}`}
                                                                            value={option}
                                                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '12px 15px',
                                                                                background: 'rgba(0, 0, 0, 0.5)',
                                                                                border: errors.options
                                                                                    ? '1px solid #ff0000'
                                                                                    : '1px solid rgba(128, 255, 0, 0.3)',
                                                                                borderRadius: '6px',
                                                                                color: 'white',
                                                                                fontSize: '16px'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {errors.options && (
                                                                    <div style={{
                                                                        color: '#ff0000',
                                                                        fontSize: '14px',
                                                                        marginTop: '5px'
                                                                    }}>
                                                                        {errors.options}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    color: '#aaa'
                                                                }}>
                                                                    Правильный ответ
                                                                </label>
                                                                <select
                                                                    name="answer"
                                                                    value={lessonForm.answer}
                                                                    onChange={handleLessonChange}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '12px 15px',
                                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                                        border: errors.answer
                                                                            ? '1px solid #ff0000'
                                                                            : '1px solid rgba(128, 255, 0, 0.3)',
                                                                        borderRadius: '6px',
                                                                        color: 'white',
                                                                        fontSize: '16px',
                                                                        appearance: 'none'
                                                                    }}
                                                                >
                                                                    {lessonForm.options.map((_, index) => (
                                                                        <option key={index} value={index}>
                                                                            Вариант {index + 1}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.answer && (
                                                                    <div style={{
                                                                        color: '#ff0000',
                                                                        fontSize: '14px',
                                                                        marginTop: '5px'
                                                                    }}>
                                                                        {errors.answer}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    color: '#aaa'
                                                                }}>
                                                                    Баллы за задание
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    name="score"
                                                                    value={lessonForm.score}
                                                                    onChange={handleLessonChange}
                                                                    min="1"
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '12px 15px',
                                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                                        border: '1px solid rgba(128, 255, 0, 0.3)',
                                                                        borderRadius: '6px',
                                                                        color: 'white',
                                                                        fontSize: '16px'
                                                                    }}
                                                                />
                                                            </div>

                                                            <button
                                                                type="submit"
                                                                style={{
                                                                    marginTop: '15px',
                                                                    padding: '14px',
                                                                    background: '#80FF00',
                                                                    color: '#000',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.2s',
                                                                    alignSelf: 'flex-start',
                                                                    minWidth: '200px'
                                                                }}
                                                                onMouseOver={e => e.target.style.background = '#aaff33'}
                                                                onMouseOut={e => e.target.style.background = '#80FF00'}
                                                            >
                                                                Добавить задание
                                                            </button>
                                                        </form>
                                                    </div>
                                                )}

                                                {/* Список заданий */}
                                                {tasks.length > 0 && (
                                                    <div style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        borderRadius: '10px',
                                                        padding: '25px'
                                                    }}>
                                                        <h3 style={{
                                                            marginTop: 0,
                                                            marginBottom: '20px',
                                                            color: '#80FF00',
                                                            fontSize: '22px'
                                                        }}>
                                                            Задания в уроке ({tasks.length})
                                                        </h3>

                                                        <div style={{
                                                            maxHeight: '400px',
                                                            overflowY: 'auto',
                                                            paddingRight: '10px'
                                                        }}>
                                                            {tasks.map((task, index) => {
                                                                try {
                                                                    const options = typeof task.options === 'string'
                                                                        ? JSON.parse(task.options)
                                                                        : task.options;

                                                                    return (
                                                                        <div key={task.id} style={{
                                                                            marginBottom: '20px',
                                                                            padding: '20px',
                                                                            background: 'rgba(0, 0, 0, 0.4)',
                                                                            borderRadius: '8px',
                                                                            borderLeft: '4px solid #80FF00'
                                                                        }}>
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                marginBottom: '15px'
                                                                            }}>
                                                                                <h4 style={{
                                                                                    margin: 0,
                                                                                    fontSize: '18px',
                                                                                    color: '#80FF00'
                                                                                }}>
                                                                                    Задание {index + 1}
                                                                                </h4>
                                                                                <span style={{
                                                                                    background: 'rgba(128, 255, 0, 0.2)',
                                                                                    padding: '5px 10px',
                                                                                    borderRadius: '12px',
                                                                                    fontSize: '14px'
                                                                                }}>
                                                                                {task.score} {task.score === 1 ? 'балл' : task.score < 5 ? 'балла' : 'баллов'}
                                                                            </span>
                                                                            </div>

                                                                            <p style={{
                                                                                marginBottom: '15px',
                                                                                fontSize: '16px'
                                                                            }}>
                                                                                {task.question}
                                                                            </p>

                                                                            <div>
                                                                                <p style={{
                                                                                    marginBottom: '10px',
                                                                                    color: '#aaa',
                                                                                    fontSize: '14px'
                                                                                }}>
                                                                                    Варианты ответов:
                                                                                </p>
                                                                                <ul style={{
                                                                                    margin: 0,
                                                                                    paddingLeft: '20px',
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    gap: '8px'
                                                                                }}>
                                                                                    {options.map((option, i) => (
                                                                                        <li
                                                                                            key={i}
                                                                                            style={{
                                                                                                color: i === task.answer ? '#80FF00' : '#ccc',
                                                                                                fontWeight: i === task.answer ? 'bold' : 'normal',
                                                                                                fontSize: '15px',
                                                                                                listStyleType: 'none',
                                                                                                position: 'relative',
                                                                                                paddingLeft: '20px'
                                                                                            }}
                                                                                        >
                                                                                            {i === task.answer && (
                                                                                                <span style={{
                                                                                                    position: 'absolute',
                                                                                                    left: 0,
                                                                                                    top: '5px',
                                                                                                    fontSize: '12px'
                                                                                                }}>✓</span>
                                                                                            )}
                                                                                            {option}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                } catch (e) {
                                                                    console.error('Error parsing options:', e);
                                                                    return null;
                                                                }
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherPanel;
