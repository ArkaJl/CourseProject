import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";

function ClassesPage({user}){
    const [data, setData] = useState([]); //получение данных с бд


    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/${user.id}/classes`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);

    const result = data.map((item) => {
        return <ul key={item.id}>
            <Link to={`/byTeacher/${item.teacher_id}/courses`} className="link">
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">{item.name}</h3>
                    <p className="padding-left-right"> --------------→</p>
                </li>
            </Link>
        </ul>
    });

    return <div className="card profile-container">
        <h2>Классы</h2>
        {result}
    </div>
}
export default ClassesPage;
