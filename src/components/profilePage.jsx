import {useEffect, useState} from "react";
import axios from "axios";
import LeaderboardPage from "./LeaderboardPage.jsx";

function ProfilePage({user}) {
    const [data, setData] = useState([]); //получение данных с бд

    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/lessonResult/${user.id}/result`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);

    const score = () => {
        let result = 0;
        for (let i = 0; i < data.length; i++) {
            result += data[i].current_score;
        }
        return result;
    }

    const ExecutedLessons = () => {
        return (
            <div className="lessons-list">
                {data.sort((a, b) => a.execution_date - b.execution_date).map((item) => (
                    <div key={item.id} className="lesson-item">
                        <ul className="notDot">
                            <li className="li-element flex">
                                <h3 className="padding-left-right">Курс: {item.name}</h3>
                                <p className="padding-left-right">Урок №{item.order}</p>
                                <p className="padding-left-right">Результат: {item.current_score}</p>
                                <p className="padding-left-right">Дата выполнения: {item.execution_date.split('T')[0]}</p>
                            </li>
                        </ul>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex">
            <div className="card profile-container" style={{ position: "relative", top: '-10px', left: '100px', right: 0, bottom: 0 }}>
                <h2>Профиль</h2>
                <div className="card flex">
                    <h3>Имя пользователя: {user.username}</h3>
                    <h3>Общее количество баллов: {score()}</h3>
                </div>
                <h2>Пройденные уроки:</h2>
                <ExecutedLessons/>
            </div>
            <LeaderboardPage user={user} />
        </div>

    );
}

export default ProfilePage;