import {useEffect, useState} from "react";
import axios from "axios";
import {faker} from "@faker-js/faker";
import {Link, useParams} from "react-router-dom";

function CourseListPage() {
    const [data, setData] = useState([]); //получение данных с бд
    const { categoryId } = useParams();


    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/categories/${categoryId}/courses`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);
    const categoryName = data[0]?.title || null;

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
        <h2>Курсы категории &#34;{categoryName}&#34;</h2>
        {result}
    </div>
}
export default CourseListPage;
