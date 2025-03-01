import {useState} from "react";
import axios from "axios";

function registryPage({ setUser }){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState('student');

    const onRegister = async (login, password, role, username) => {
        try {
            await axios.post('http://localhost:5000/api/register', { login, password, role ,username});
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onRegister( email, password, role, username);
        if (success) {
            alert('Successful!');
            setUser(email)
        } else {
            alert('Fail!');
        }
    };


    return <div className="form-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Имя" required onChange={(evt) => setUsername(evt.target.value)}/>
            <input type="email" placeholder="Логин" onChange={(evt) => setEmail(evt.target.value)}/>
            <input type="password" placeholder="Пароль" required onChange={(evt) => setPassword(evt.target.value)}/>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
            </select>
            <button type="submit" className="button">Зарегистрироваться</button>
        </form>
    </div>
}

export default registryPage;
