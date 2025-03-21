import {useEffect, useState} from "react";
import axios from "axios";

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
    const ExecutedLessons = () =>{
        return data.sort((a, b) => a.executeon_date - b.executeon_date).map((item) => {
            return <ul key={item.id}>
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">Курс: {item.name}</h3>
                    <p className="padding-left-right">Урок №{item.order}</p>
                    <p className="padding-left-right">Результат: {item.current_score}</p>
                    <p className="padding-left-right">Дата выполнения: {item.executeon_date}</p>
                </li>
            </ul>
        })
    }


    return <div className="card profile-container">

        <h2>Профиль</h2>
        <div className="card flex">
            <h3>Имя пользователя: {user.username}</h3>
            <h3>Общее количество баллов: {score()}</h3>
        </div>
        <h2>Пройденные уроки:</h2>
        <p>{ExecutedLessons()}</p>
    </div>;
}

export default ProfilePage;
