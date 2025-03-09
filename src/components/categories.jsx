import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {faker} from "@faker-js/faker"

function categories(){
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
            fakeItem[i] = {name: faker.book.author(), description: faker.lorem.paragraph(), id: i};
        }
        return fakeItem;
    }

    const result = data.map((item) => {
        return <ul key={item.id}>
            <Link to={`/categories/${item.id}/courses`} className="link">
                <li className="li-element notDot flex">
                    <h3 className="padding-left-right">{item.title}</h3>
                    <p className="padding-left-right">{item.description} --------------→</p>
                </li>
            </Link>
        </ul>
    })

    return <div className="card">
        <h2>Категории</h2>
        {result}
    </div>
}

export default categories;
