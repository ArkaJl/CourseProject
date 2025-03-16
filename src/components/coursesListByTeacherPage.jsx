import {useEffect, useState} from "react";
import axios from "axios";
import {faker} from "@faker-js/faker";
import {Link, useParams} from "react-router-dom";

function CourseListPage() {
    const [data, setData] = useState([]); //получение данных с бд
    const { teacherId } = useParams();


    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/${teacherId}/courses`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);

    const fake = () => {
        const fakeItem = []
        for (let i = 0; i < 10; i++) {
            fakeItem[i] = {name: faker.company.name(), description: faker.lorem.text(), id: i};
        }
        return fakeItem;
    }

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
        <h2>{data[0]? "Курсы от пользователя": "У пользователя нет курсов"} {data[0]? <z>&#34; {data[0].username} &#34;</z> : null}</h2>
        {result}
    </div>
}
export default CourseListPage;
