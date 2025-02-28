import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sys'
});

connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключение к базе данных успешно установлено');
});

app.get('/api/data/users', (req, res) => {
    const query = 'SELECT * FROM users';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса:', err);
            res.status(500).send('Ошибка сервера' + err.message);
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});