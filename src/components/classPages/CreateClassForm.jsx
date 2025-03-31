import { useState } from "react";
import axios from "axios";

export default function CreateClassForm({ teacherId, onClassCreated }) {
    const [className, setClassName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:5000/api/classes", {
                name: className,
                teacher_id: teacherId
            });
            onClassCreated(response.data);
            setClassName("");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка при создании класса");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-class-form">
            <h3>Создать новый класс</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Название класса"
                    required
                    className="form-input"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="button"
                    style={{ marginTop: '10px' }}
                >
                    {loading ? "Создание..." : "Создать класс"}
                </button>
                {error && <p className="error" style={{ marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
}