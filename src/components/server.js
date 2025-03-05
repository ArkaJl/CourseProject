import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sys',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.get('/api/data/users', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM users');
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

app.get('/api/data/categories', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categories');
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});
app.get('/api/data/categories/:categoryId/courses', async (req, res) => {
    const {categoryId} = req.params;
    try {
        const [results] = await pool.query('SELECT * FROM courses WHERE categoryId=?', [categoryId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});
app.get('/api/data/courses/:courseId/lessons', async (req, res) => {
    const {courseId} = req.params;
    try {
        const [results] = await pool.query('SELECT * FROM lessons WHERE courseId=?', [courseId]);
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});



app.get('/api/data/courses', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM courses');
        res.json(results);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
});

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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
