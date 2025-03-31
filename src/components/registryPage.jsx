import { useState } from "react";
import axios from "axios";

function RegistryPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        role: "student"
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        username: "",
        form: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: "",
            password: "",
            username: "",
            form: ""
        };

        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = "Имя обязательно";
            isValid = false;
        } else if (formData.username.length < 2) {
            newErrors.username = "Имя слишком короткое";
            isValid = false;
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = "Email обязателен";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Введите корректный email";
            isValid = false;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "Пароль обязателен";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Пароль должен содержать минимум 6 символов";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, form: "" }));
        setSuccessMessage("");

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                login: formData.email,
                password: formData.password,
                role: formData.role,
                username: formData.username
            });
            console.log(response)

            if (response.data.success) {
                setSuccessMessage("Регистрация прошла успешно!");
            } else {
                setErrors(prev => ({
                    ...prev,
                    form: response.data.message || "Ошибка регистрации"
                }));
            }
        } catch (error) {
            console.error("Registration error:", error);
            setErrors(prev => ({
                ...prev,
                form: error.response?.data?.message ||
                    "Ошибка при регистрации. Пожалуйста, попробуйте позже."
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Регистрация</h2>

            {errors.form && <div className="error-message">{errors.form}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Имя"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? "input-error" : ""}
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "input-error" : ""}
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <div>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
                </button>
            </form>
        </div>
    );
}

export default RegistryPage;