import { useState } from "react";
import axios from "axios";

function AuthPage({ setUser }) {
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        login: '',
        password: '',
        form: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            login: '',
            password: '',
            form: ''
        };

        // Validate login (email)
        if (!formData.login.trim()) {
            newErrors.login = 'Email обязателен';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.login)) {
            newErrors.login = 'Введите корректный email';
            valid = false;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
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
        setErrors(prev => ({ ...prev, form: '' }));


        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                login: formData.login,
                password: formData.password
            });

            if (response.data.user) {
                setUser(response.data.user);
            } else {
                setErrors(prev => ({
                    ...prev,
                    form: response.data.message || 'Неверные учетные данные'
                }));
            }
        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Ошибка при входе";

            if (error.response) {
                errorMessage = error.response.data.message ||
                    `Ошибка сервера: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "Сервер не отвечает. Проверьте подключение.";
            }

            setErrors(prev => ({ ...prev, form: errorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Авторизация</h2>

            {errors.form && <div className="error-message">{errors.form}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        name="login"
                        placeholder="Email"
                        value={formData.login}
                        onChange={handleChange}
                        className={errors.login ? "input-error" : ""}
                        autoComplete="username"
                    />
                    {errors.login && <div className="error-message">{errors.login}</div>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "input-error" : ""}
                        autoComplete="current-password"
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <button
                    type="submit"
                    className="button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Вход..." : "Войти"}
                </button>
            </form>
        </div>
    );
}

export default AuthPage;