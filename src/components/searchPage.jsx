import {useEffect, useState} from "react";
import {faker} from "@faker-js/faker";
import {Link} from "react-router-dom";
import axios from "axios";

function SearchPage() {
    const [term, setTerm] = useState('');
    const [data, setData] = useState([]); //получение данных с бд


    useEffect(() => {
        // Запрос данных с сервера
        axios.get('http://localhost:5000/api/data/courses')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);
    console.log(data)

    const sortedTerm = data.filter(item => item.name.toLowerCase().includes(term.toLowerCase()));



    return <div>
        <form className="card ">
            <h2>Поиск курсов</h2>
            <input type="text" id="searchInput" onChange={(e) => {
                setTerm(e.target.value)
            }}/>
        </form>
        <div className="profile-container">{sortedTerm.map((item) => {
            return <ul key={item.id}>
                <Link to={`/courses/${item.course_id}/lessons`} className="link">
                    <li className="li-element notDot flex">
                        <h3 className="padding-left-right">By {item.username}</h3>
                        <h3 className="padding-left-right"> ---- {item.name} ----</h3>
                    </li>
                </Link>
            </ul>
        }).sort((a, b) => a.order - b.order)}</div>
    </div>
}
export default SearchPage;
