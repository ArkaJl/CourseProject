import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from "bcrypt";

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

//пользователи для автризации
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
        const [results] = await pool.query('SELECT cs.*, cl.name, cl.teacher_id\n' +
            'FROM class_students cs \n' +
            'JOIN classes cl ON cs.class_id = cl.id \n' +
            'WHERE cs.student_id = ?', [user]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

//тут список курсоов определенного учителя
app.get('/api/data/:teacherId/courses-with-lessons', async (req, res) => {
    const {teacherId} = req.params;
    try {
        const [results] = await pool.query('SELECT l.*, c.teacher_id, c.name, u.username FROM courses c JOIN lessons l ON l.course_id = c.id JOIN users u ON c.teacher_id = u.id WHERE c.teacher_id=?', [teacherId]);
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
        const [results] = await pool.query('SELECT * FROM courses WHERE category_id=?', [categoryId]);
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
        const [results] = await pool.query('SELECT l.*, c.teacher_id, c.name, u.username FROM courses c JOIN lessons l ON l.course_id = c.id JOIN users u ON c.teacher_id = u.id');
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
        res.status(201).json({ message: 'Пользователь зарегистрирован', userId: result.insertId });
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
        // Преобразуем массив options в JSON строку
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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
