import {useEffect, useState} from "react";
import axios from "axios";
import {faker} from "@faker-js/faker";
import {Link} from "react-router-dom";

function CourseListPage() {
    const [data, setData] = useState([]); //получение данных с бд


    useEffect(() => {
        // Запрос данных с сервера
        axios.get('http://localhost:5000/api/data/categories')
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

    const result = fake().map((item) => {
        return <ul key={item.id}>
            <Link to={`/courses/${item.id}/lessons`} className="link">
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">{item.name}</h3>
                    <p className="padding-left-right">{item.description} --------------→</p>
                </li>
            </Link>
        </ul>
    });

    return <div className="card">
        <h2>Курсы</h2>
        {result}
    </div>
}
export default CourseListPage;
