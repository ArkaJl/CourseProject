import {useEffect, useState} from "react";
import {faker} from "@faker-js/faker";
import {Link} from "react-router-dom";
import axios from "axios";

function SearchPage() {
    const [term, setTerm] = useState('');
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
            fakeItem[i] = {name: faker.company.name(), description: faker.lorem.text(), id: i, order: i+1};
        }
        return fakeItem;
    }

    const sortedTerm = fake().filter(item => item.name.toLowerCase().includes(term.toLowerCase()));

    const handleSubmitSearch = (evt) =>{
        evt.preventDefault();
        setTerm(evt.target.value);
    }


    return <div>
        <form onSubmit={handleSubmitSearch} className="card ">
            <h2>Поиск курсов</h2>
            <input type="text" id="searchInput" onChange={(e) => {
                setTerm(e.target.value)
            }}/>
            <button className="button" type="submit">🎶 Поиск! 🎶</button>
        </form>
        <div>{sortedTerm.map((item) => {
            return <ul key={item.id}>
                <Link to={`/lessons/${item.id}/task`} className="link">
                    <li className="li-element notDot flex">
                        <h3 className="padding-left-right">{item.order}</h3>
                        <h3 className="padding-left-right">{item.name}</h3>
                        <p className="padding-left-right">{item.description} --------------→</p>
                    </li>
                </Link>
            </ul>
        }).sort((a, b) => a.order - b.order)}</div>
    </div>
}
export default SearchPage;
