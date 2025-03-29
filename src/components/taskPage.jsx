import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function TaskPage({ user }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [existingResultId, setExistingResultId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [answersLog, setAnswersLog] = useState([]); // Новое состояние для логирования ответов

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.answer;
        const questionScore = isCorrect ? (currentQuestion.score || 1) : 0;

        // Логируем каждый ответ
        setAnswersLog(prev => [
            ...prev,
            {
                questionId: currentQuestion.id,
                isCorrect,
                score: questionScore
            }
        ]);

        // Сразу вычисляем новые значения
        const newCorrectCount = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
        const newTotalScore = totalScore + questionScore;

        setCorrectAnswersCount(newCorrectCount);
        setTotalScore(newTotalScore);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            // Передаём актуальные значения при завершении
            handleFinishQuiz(newTotalScore);
        }
    };

    const handleFinishQuiz = async (finalScore) => {
        console.log("Saving to DB with score:", finalScore); // Отладочный вывод
        console.log("Answers log:", answersLog); // История ответов

        try {
            const execution_date = new Date().toISOString().split('T')[0];
            const payload = {
                lesson_id: lessonId,
                student_id: user.id,
                current_score: finalScore, // Используем переданное значение
                execution_date
            };

            const response = existingResultId
                ? await axios.put(`http://localhost:5000/api/task-complete/${existingResultId}`, payload)
                : await axios.post('http://localhost:5000/api/task-complete', payload);

            console.log("Save result response:", response.data);
            setShowResult(true);
        } catch (err) {
            console.error('Ошибка сохранения:', err.response?.data || err.message);
            setError(`Ошибка сохранения: ${err.response?.data?.error || err.message}`);
        }
    };

    const { lessonId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Загрузка вопросов
                const questionsResponse = await axios.get(`http://localhost:5000/api/data/${lessonId}/questions`);
                setQuestions(questionsResponse.data);

                // Проверка существующего результата
                if (user?.id) {
                    const resultResponse = await axios.get(
                        `http://localhost:5000/api/results?lesson_id=${lessonId}&student_id=${user.id}`
                    );
                    if (resultResponse.data && resultResponse.data.length > 0) {
                        setExistingResultId(resultResponse.data[0].id);
                    }
                }
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные урока');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lessonId, user?.id]);


    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };


    const handleContinue = () => {
        navigate(-1);
    };

    if (isLoading) return <div className="card">Загрузка...</div>;
    if (error) return <div className="card error">{error}</div>;
    if (questions.length === 0) return <div className="card">Нет вопросов для этого урока</div>;

    return (
        <div className="profile-container">
            {showResult ? (
                <div className="card">
                    <h1>Ваш результат</h1>
                    <h2>Правильных ответов: {correctAnswersCount} из {questions.length}</h2>
                    <h2>Общий балл: {totalScore}</h2>
                    <button className="button" onClick={handleContinue}>
                        Продолжить
                    </button>
                </div>
            ) : (
                <div className="card">
                    <h1>Вопрос {currentQuestionIndex + 1} из {questions.length}</h1>
                    <h2>{questions[currentQuestionIndex].question}</h2>
                    <ul className="notDot">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                            <li
                                key={index}
                                className={`li-element ${selectedAnswer === index ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(index)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    <div className="flex">
                        <button
                            className="button"
                            onClick={handleNextQuestion}
                            disabled={selectedAnswer === null}
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskPage;