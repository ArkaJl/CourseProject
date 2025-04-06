import {useEffect, useState} from "react";
import axios from "axios";
import {Link, useParams} from "react-router-dom";

function TeachersCourses() {
    const [data, setData] = useState([]); //получение данных с бд
    const { teacherId } = useParams();


    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/${teacherId}/courses-with-lessons`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);
    console.log(data);


    const result = data.map((item) => {
        return <ul key={item.id}>
            <Link to={`/courses/${item.id}/lessons`} className="link">
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">{item.name}</h3>
                    <p className="padding-left-right"> --------------→</p>
                </li>
            </Link>
        </ul>
    });

    return <div className="card profile-container">
        <h2>Курсы преподавателя класса</h2>
        {result}
    </div>
}
export default TeachersCourses;
