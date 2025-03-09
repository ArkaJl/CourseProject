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
                    <h3 className="padding-left-right">Course: {item.name}</h3>
                    <p className="padding-left-right">Lesson №{item.order}</p>
                    <p className="padding-left-right">Result: {item.score}</p>
                    <p className="padding-left-right">Executed Date: {item.executeon_date}</p>
                </li>
            </ul>
        })
    }


    return <div className="card profile-container">
        <h1>Profile</h1>
        <h3>User name: {user.name}</h3>
        <h3>Score: {score()}</h3>
        <h2>Executed lessons:</h2>
        <p>{ExecutedLessons()}</p>
    </div>;
}
export default ProfilePage;