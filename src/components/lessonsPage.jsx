import {useEffect, useState} from "react";
import axios from "axios";
import {faker} from "@faker-js/faker";
import {Link, useParams} from "react-router-dom";

function LessonsPage() {
    const [data, setData] = useState([]); //получение данных с бд
    const { courseId } = useParams();


    useEffect(() => {
        // Запрос данных с сервера
        axios.get(`http://localhost:5000/api/data/courses/${courseId}/lessons`)
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
            fakeItem[i] = {name: faker.company.name(), description: faker.lorem.text(), id: i, order: i+1};
        }
        return fakeItem;
    }

    const result = data.sort((a, b) => a.order - b.order).map((item) => {
        return <ul key={item.id}>
            <Link to={`/lessons/${item.id}/questions`} className="link">
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">{item.order}</h3>
                    <h3 className="padding-left-right">{item.name}</h3>
                    <p className="padding-left-right">{item.description} --------------→</p>
                </li>
            </Link>
        </ul>
    })

    return <div className="card profile-container">
        <h2>Уроки</h2>
        {result}
    </div>
}
export default LessonsPage;
