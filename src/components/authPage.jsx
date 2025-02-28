import {useEffect, useState} from "react";
import axios from "axios";

function AuthPage({user, setUser}) {

    const [data, setData] = useState([]); //получение данных с бд

    const [username, setUsername] = useState(''); //данные с полей ввода логин
    const [password, setPassword] = useState(''); //данные с полей ввода пароль



    useEffect(() => {
        // Запрос данных с сервера
        axios.get('http://localhost:5000/api/data/users')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Ошибка при запросе данных:', error);
            });
    }, []);

    const login = (username, password) => {
        return data.find((item) => {
            if ((item.login === username) && (item.password === password)) {
                console.log("success", item);
                setUser(item);
                return item;
            } else {
                console.log("error", item);
            }
        });
    };

    const handleSubmit =  (e) => {
        e.preventDefault();
        login(username, password);
    };


    return (
        <div className="form-container">
            <h2>Авторизация</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Логин" required value={username}
                       onChange={(e) => setUsername(e.target.value)}/>
                <input type="password" placeholder="Пароль" required value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit" className="button">Войти</button>
            </form>
        </div>
    )
}

export default AuthPage;