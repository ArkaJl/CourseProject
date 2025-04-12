import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost', //localhost MySQL-8.2
    user: 'root',
    password: '1234',
    database: 'db2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//пользователи для авторизации
app.post('/api/auth/login', async (req, res) => {
    const { login, password } = req.body;
    console.log('Login attempt:', login); // Логируем только логин (без пароля)

    try {
        // Находим пользователя
        const [users] = await pool.query(
            'SELECT id, login, role, username, password FROM users WHERE login = ?',
            [login]
        );

        if (users.length === 0) {
            console.log('User not found:', login);
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const user = users[0];

        // Прямое сравнение паролей (без хеширования)
        if (password !== user.password) {
            console.log('Invalid password for user:', login);
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        // Создаем объект пользователя без пароля
        const userResponse = {
            id: user.id,
            login: user.login,
            role: user.role,
            username: user.username
        };

        console.log('Successful login:', userResponse);
        res.json({ user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

//Задания уроков
app.get('/api/data/:lessonId/questions', async (req, res) => {
    const { lessonId } = req.params;
    try {
        const [results] = await pool.query('SELECT * FROM tasks WHERE lesson_id = ?', [lessonId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//список классов пользователя
app.get('/api/data/:user/classes', async (req, res) => {
    const {user} = req.params;
    try {
        const [results] = await pool.query('SELECT cs.*, cl.name, cl.teacher_id, u.id, u.username FROM class_students cs JOIN classes cl ON cs.class_id = cl.id JOIN users u ON u.id = cl.teacher_id WHERE cs.student_id = ?', [user]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//тут список курсов определенного учителя
app.get('/api/data/:classId/courses-with-lessons', async (req, res) => {
    const {classId} = req.params;
    try {
        const [results] = await pool.query('select c.* From courses c where c.teacher_id = ?', [classId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//список категорий
app.get('/api/data/categories', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categories');
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//список курсов в категории
app.get('/api/data/categories/:categoryId/courses', async (req, res) => {
    const {categoryId} = req.params;
    try {
        const [results] = await pool.query('SELECT c.*, ca.title FROM courses c join categories ca on ca.id = c.category_id WHERE c.category_id=?', [categoryId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//список уроков в курсе
app.get('/api/data/courses/:courseId/lessons', async (req, res) => {
    const {courseId} = req.params;
    try {
        const [results] = await pool.query('SELECT * FROM lessons WHERE course_id=?', [courseId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//результаты уроков пользователя
app.get('/api/data/lessonResult/:userId/result', async (req, res) => {
    const {userId} = req.params;
    try {
        const [results] = await pool.query('SELECT lr.*, l.description, l.order, c.name\n' +
            'FROM lesson_result lr \n' +
            'JOIN lessons l ON lr.lesson_id = l.id \n' +
            'JOIN courses c ON l.course_id = c.id \n' +
            'WHERE lr.student_id = ?', [userId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//Поиск курсов
app.get('/api/data/courses', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT l.course_id, c.teacher_id, MAX(c.name) AS name, MAX(u.username) AS username\n' +
            'FROM courses c\n' +
            'JOIN lessons l ON l.course_id = c.id\n' +
            'JOIN users u ON c.teacher_id = u.id\n' +
            'GROUP BY l.course_id, c.teacher_id');
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//регистрация пользователей
app.post('/api/register', async (req, res) => {
    const { login, password, role , username} = req.body;

    try {
        const query = `
      INSERT INTO users (login, password, role, username)
      VALUES (?, ?, ?, ?)`;

        const [result] = await pool.execute(query, [login, password, role, username]);
        res.status(201).json({ success: 'Пользователь зарегистрирован', userId: result.insertId });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

//внесение результатов теста
app.post('/api/task-complete', async (req, res) => {
    console.log('Received data:', req.body); // Логируем входящие данные

    try {
        const { lesson_id, student_id, current_score, execution_date } = req.body;

        // Валидация
        if (!lesson_id || !student_id || current_score === undefined) {
            console.error('Validation failed: missing fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await pool.query(
            'INSERT INTO lesson_result (lesson_id, student_id, current_score, execution_date) VALUES (?, ?, ?, ?)',
            [lesson_id, student_id, current_score, execution_date]
        );

        console.log('Inserted with ID:', result.insertId);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ error: 'Database Error' });
    }
});

// Создание курса (для преподавателей)
app.post('/api/courses', async (req, res) => {
    const { name, teacher_id, category_id } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO courses (name, teacher_id, category_id) VALUES (?, ?, ?)',
            [name, teacher_id, category_id]
        );

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Список курсов преподавателя
app.get('/api/data/:teacherId/courses', async (req, res) => {
    const { teacherId } = req.params;

    try {
        const [results] = await pool.query(`
            SELECT c.*, cat.title as category_title 
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.teacher_id = ?
        `, [teacherId]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание урока
app.post('/api/lessons', async (req, res) => {
    const { description, course_id, order } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO lessons (description, course_id, `order`) VALUES (?, ?, ?)',
            [description, course_id, order]
        );

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание задания
app.post('/api/tasks', async (req, res) => {
    const { lesson_id, question, text, options, answer, score } = req.body;

    try {
        const optionsJson = JSON.stringify(options);

        await pool.execute(
            'INSERT INTO tasks (lesson_id, question, text, options, answer, score) VALUES (?, ?, ?, ?, ?, ?)',
            [lesson_id, question, text, optionsJson, answer, score]
        );

        res.status(201).json({ message: 'Задание создано' });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Получение курсов преподавателя с уроками
app.get('/api/teacher-courses/:teacherId', async (req, res) => {
    try {
        const [courses] = await pool.query(`
            SELECT c.*, cat.title as category_name 
            FROM courses c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.teacher_id = ?
        `, [req.params.teacherId]);

        // Для каждого курса загружаем уроки
        const coursesWithLessons = await Promise.all(courses.map(async course => {
            const [lessons] = await pool.query(
                'SELECT * FROM lessons WHERE course_id = ? ORDER BY `order`',
                [course.id]
            );
            return { ...course, lessons };
        }));

        res.json(coursesWithLessons);
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление курса (с каскадным удалением уроков и заданий)
app.delete('/api/courses/:courseId', async (req, res) => {
    try {
        // Удаляем все задания уроков курса
        await pool.query(`
            DELETE t FROM tasks t
            JOIN lessons l ON t.lesson_id = l.id
            WHERE l.course_id = ?
        `, [req.params.courseId]);

        // Удаляем все уроки курса
        await pool.query('DELETE FROM lessons WHERE course_id = ?', [req.params.courseId]);

        // Удаляем сам курс
        await pool.query('DELETE FROM courses WHERE id = ?', [req.params.courseId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Ошибка при удалении курса' });
    }
});

// Удаление урока (с каскадным удалением заданий)
app.delete('/api/lessons/:lessonId', async (req, res) => {
    try {
        // Удаляем все задания урока
        await pool.query('DELETE FROM tasks WHERE lesson_id = ?', [req.params.lessonId]);

        // Удаляем сам урок
        await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.lessonId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ error: 'Ошибка при удалении урока' });
    }
});

// Удаление задания
app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Ошибка при удалении задания' });
    }
});

// Получение заданий урока (полная исправленная версия)
app.get('/api/lesson-tasks/:lessonId', async (req, res) => {
    try {
        // 1. Проверяем существование урока
        const [lesson] = await pool.query(
            'SELECT id FROM lessons WHERE id = ?',
            [req.params.lessonId]
        );

        if (lesson.length === 0) {
            return res.status(404).json({ error: 'Урок не найден' });
        }

        // 2. Получаем задания
        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE lesson_id = ?',
            [req.params.lessonId]
        );

        // 3. Обрабатываем варианты ответов
        const processedTasks = tasks.map(task => {
            try {
                return {
                    ...task,
                    // Парсим JSON или используем массив, если уже распаршено
                    options: typeof task.options === 'string'
                        ? JSON.parse(task.options)
                        : task.options || []
                };
            } catch (e) {
                console.error(`Error parsing options for task ${task.id}:`, e);
                return {
                    ...task,
                    options: [] // Возвращаем пустой массив при ошибке парсинга
                };
            }
        });

        res.json(processedTasks);
    } catch (error) {
        console.error('Error fetching lesson tasks:', error);
        res.status(500).json({
            error: 'Ошибка сервера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 1. Проверка существующего результата урока для студента
app.get('/api/results', async (req, res) => {
    const { lesson_id, student_id } = req.query;

    try {
        const [results] = await pool.query(
            'SELECT id FROM lesson_result WHERE lesson_id = ? AND student_id = ?',
            [lesson_id, student_id]
        );

        res.json(results);
    } catch (error) {
        console.error('Error checking existing result:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 2. Обновление существующего результата (PUT вместо POST)
app.put('/api/task-complete/:id', async (req, res) => {
    const { id } = req.params;
    const { lesson_id, student_id, current_score, execution_date } = req.body;

    try {
        await pool.execute(
            'UPDATE lesson_result SET current_score = ?, execution_date = ? WHERE id = ?',
            [current_score, execution_date, id]
        );

        res.json({ message: 'Результат обновлен' });
    } catch (error) {
        console.error('Error updating result:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// 3. Модифицированный POST /api/task-complete (с исправленным именем поля)
app.post('/api/task-complete', async (req, res) => {
    const { lesson_id, student_id, current_score, execution_date } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO lesson_result (lesson_id, student_id, current_score, execution_date) VALUES (?, ?, ?, ?)',
            [lesson_id, student_id, current_score, execution_date]
        );

        res.status(201).json({
            message: 'Результаты внесены',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


// Получение классов преподавателя с количеством студентов
app.get('/api/teacher/:teacherId/classes', async (req, res) => {
    try {
        const [classes] = await pool.query(`
            SELECT c.*, COUNT(cs.student_id) as student_count
            FROM classes c
            LEFT JOIN class_students cs ON c.id = cs.class_id
            WHERE c.teacher_id = ?
            GROUP BY c.id
        `, [req.params.teacherId]);
        res.json(classes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение студентов класса с прогрессом
app.get('/api/classes/:classId/students', async (req, res) => {
    try {
        const [students] = await pool.query(`
SELECT 
    u.id, 
    u.username, 
    u.role,
    COUNT(DISTINCT lr.lesson_id) AS completed_lessons
FROM 
    users u
JOIN 
    class_students cs ON u.id = cs.student_id AND cs.class_id = ?
LEFT JOIN 
    lesson_result lr ON u.id = lr.student_id
GROUP BY 
    u.id, u.username, u.role
        `, [req.params.classId]);
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение прогресса студента по курсам преподавателя
app.get('/api/students/:studentId/progress', async (req, res) => {
    try {
        const { teacher_id } = req.query;

        if (!teacher_id) {
            return res.status(400).json({ error: 'Не указан teacher_id' });
        }

        const [progress] = await pool.query(`
            SELECT 
                lr.*, 
                l.description as lesson_description,
                c.name as course_name
            FROM lesson_result lr
            JOIN lessons l ON lr.lesson_id = l.id
            JOIN courses c ON l.course_id = c.id
            WHERE lr.student_id = ? AND c.teacher_id = ?
            ORDER BY lr.execution_date DESC
        `, [req.params.studentId, teacher_id]);

        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Получение информации о классе
app.get('/api/classes/:id', async (req, res) => {
    try {
        const [classes] = await pool.query(
            'SELECT id, name, teacher_id FROM classes WHERE id = ?',
            [req.params.id]
        );

        if (classes.length === 0) {
            return res.status(404).json({ error: 'Класс не найден' });
        }

        res.json(classes[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Создание класса
// Создание класса
app.post('/api/classes', async (req, res) => {
    try {
        const { name, teacher_id } = req.body;

        if (!name || !teacher_id) {
            return res.status(400).json({ error: 'Не указано название класса или ID преподавателя' });
        }

        // Проверяем, существует ли преподаватель
        const [teacher] = await pool.query(
            'SELECT id FROM users WHERE id = ? AND role = "teacher"',
            [teacher_id]
        );

        if (teacher.length === 0) {
            return res.status(400).json({ error: 'Преподаватель не найден' });
        }

        const [result] = await pool.query(
            'INSERT INTO classes (name, teacher_id) VALUES (?, ?)',
            [name, teacher_id]
        );

        // Возвращаем полную информацию о созданном классе
        const [newClass] = await pool.query(`
            SELECT c.*, 0 as student_count 
            FROM classes c 
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json(newClass[0]);
    } catch (error) {
        console.error('Ошибка при создании класса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание запроса на вступление
app.post('/api/class-requests', async (req, res) => {
    try {
        const { class_id, student_id } = req.body;

        // Проверяем существует ли класс
        const [classes] = await pool.query(
            'SELECT teacher_id FROM classes WHERE id = ?',
            [class_id]
        );

        if (classes.length === 0) {
            return res.status(404).json({ error: 'Класс не найден' });
        }

        // Проверяем не состоит ли уже студент в классе
        const [existing] = await pool.query(
            'SELECT id FROM class_students WHERE class_id = ? AND student_id = ?',
            [class_id, student_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Вы уже состоите в этом классе' });
        }

        // Проверяем существующий запрос
        const [requests] = await pool.query(
            'SELECT id FROM class_requests WHERE class_id = ? AND student_id = ?',
            [class_id, student_id]
        );

        if (requests.length > 0) {
            return res.status(400).json({ error: 'Запрос уже отправлен' });
        }

        // Создаем запрос
        const [result] = await pool.query(
            'INSERT INTO class_requests (class_id, student_id) VALUES (?, ?)',
            [class_id, student_id]
        );

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при создании запроса' });
    }
});

// Получение запросов для преподавателя
app.get('/api/class-requests', async (req, res) => {
    try {
        const { teacher_id } = req.query;
        const [requests] = await pool.query(`
            SELECT cr.*, u.username as student_name, c.name as class_name
            FROM class_requests cr
            JOIN classes c ON cr.class_id = c.id
            JOIN users u ON cr.student_id = u.id
            WHERE c.teacher_id = ? AND cr.status = 'pending'
        `, [teacher_id]);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении запросов' });
    }
});

// Обработка запроса (принять/отклонить)
app.put('/api/class-requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        // Получаем запрос
        const [requests] = await pool.query(`
            SELECT cr.*, c.teacher_id
            FROM class_requests cr
            JOIN classes c ON cr.class_id = c.id
            WHERE cr.id = ?
        `, [id]);

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Запрос не найден' });
        }

        const request = requests[0];

        if (action === 'approve') {
            // Добавляем студента в класс
            await pool.query(
                'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
                [request.class_id, request.student_id]
            );
        }

        // Обновляем статус запроса
        await pool.query(
            'UPDATE class_requests SET status = ? WHERE id = ?',
            [action === 'approve' ? 'approved' : 'rejected', id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обработке запроса' });
    }
});

// Получение информации о пользователе по ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, role FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: 'Пользователь не найден',
                id: req.params.id
            });
        }

        res.json({
            id: users[0].id,
            username: users[0].username,
            role: users[0].role
        });
    } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: err.message
        });
    }
});

// Удаление студента из класса
app.delete('/api/classes/:classId/students/:studentId', async (req, res) => {
    try {
        const { classId, studentId } = req.params;

        // Проверяем, существует ли класс
        const [classes] = await pool.query(
            'SELECT id FROM classes WHERE id = ?',
            [classId]
        );

        if (classes.length === 0) {
            return res.status(404).json({ error: 'Класс не найден' });
        }

        // Удаляем студента из класса
        await pool.query(
            'DELETE FROM class_students WHERE class_id = ? AND student_id = ?',
            [classId, studentId]
        );

        // Также удаляем все запросы этого студента в этот класс
        await pool.query(
            'DELETE FROM class_requests WHERE class_id = ? AND student_id = ?',
            [classId, studentId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing student from class:', error);
        res.status(500).json({ error: 'Ошибка при удалении студента из класса' });
    }
});

// Таблица лидеров - топ 3
app.get('/api/leaderboard/top', async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                SUM(lr.current_score) as total_score
            FROM 
                users u
            JOIN 
                lesson_result lr ON u.id = lr.student_id
            GROUP BY 
                u.id
            ORDER BY 
                total_score DESC
            LIMIT 3
        `);
        res.json(results);
    } catch (err) {
        console.error('Ошибка получения топ-3 лидеров:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Таблица лидеров - позиция пользователя и соседи
app.get('/api/leaderboard/nearby', async (req, res) => {
    try {
        const { userId } = req.query;

        // Сначала получаем общий рейтинг всех пользователей
        const [allUsers] = await pool.query(`
            SELECT 
                u.id,
                u.username,
                SUM(lr.current_score) as total_score,
                RANK() OVER (ORDER BY SUM(lr.current_score) DESC) as position
            FROM 
                users u
            LEFT JOIN 
                lesson_result lr ON u.id = lr.student_id
            GROUP BY 
                u.id
            ORDER BY 
                total_score DESC
        `);

        // Находим текущего пользователя
        const currentUser = allUsers.find(u => u.id == userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Находим индекс пользователя в общем списке
        const userIndex = allUsers.findIndex(u => u.id == userId);

        // Определяем диапазон для соседних пользователей (8 выше и 2 ниже)
        const start = Math.max(0, userIndex - 8);
        const end = Math.min(allUsers.length, userIndex + 3); // +3 потому что включаем самого пользователя + 2 ниже

        // Получаем соседних пользователей
        const nearbyUsers = allUsers.slice(start, end);

        res.json({
            userPosition: currentUser.position,
            nearbyUsers: nearbyUsers
        });
    } catch (err) {
        console.error('Ошибка получения позиции пользователя:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
