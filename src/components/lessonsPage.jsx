import {useEffect, useState} from "react";
import axios from "axios";
import {Link, useParams} from "react-router-dom";

function LessonsPage({user}) {
    const [data, setData] = useState([]);
    const [dataRes, setDataRes] = useState([]);//получение данных с бд
    const { courseId } = useParams();

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [response1, response2] = await Promise.all([
                    axios.get(`http://localhost:5000/api/data/courses/${courseId}/lessons`),
                    axios.get(`http://localhost:5000/api/data/lessonResult/${user.id}/result`)
                ])
                const result1 = await response1.data;
                const result2 = await response2.data;

                setData(result1);
                setDataRes(result2);

            } catch (err) {
                console.error('Ошибка загрузки классов:', err);
            }

        };
        fetchData();
    }, []);

    const dataResmas =  dataRes.map((item) => item.lesson_id)


    const result = data.sort((a, b) => a.order - b.order).map((item) => {
        return <ul key={item.id}>
            <Link to={`/lessons/${item.id}/questions`} className="link" >
                <li className={dataResmas.includes(item.id) ? "button notDot flex" : "li-element notDot flex"}>
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
