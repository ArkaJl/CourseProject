import { useState } from "react";
import axios from "axios";

export default function JoinClassForm({ studentId }) {
    const [classId, setClassId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await axios.post("http://localhost:5000/api/class-requests", {
                class_id: classId,
                student_id: studentId
            });
            setMessage("Запрос на вступление отправлен преподавателю");
            setClassId("");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка при отправке запроса");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-class-form">
            <h3>Вступить в класс</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    placeholder="ID класса"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Отправка..." : "Отправить запрос"}
                </button>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}