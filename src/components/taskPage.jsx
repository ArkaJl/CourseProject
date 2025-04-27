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
    const [answersLog, setAnswersLog] = useState([]);
    const [showAnswerFeedback, setShowAnswerFeedback] = useState(false); // Новое состояние для отображения фидбека
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false); // Новое состояние для правильности ответа

    const handleAnswerSelect = (answerIndex) => {
        if (showAnswerFeedback) return; // Блокируем выбор ответа, пока показывается фидбек
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.answer;

        // Логируем ответ
        setAnswersLog(prev => [
            ...prev,
            {
                questionId: currentQuestion.id,
                isCorrect,
                score: isCorrect ? (currentQuestion.score || 1) : 0
            }
        ]);

        // Обновляем счетчики
        const newCorrectCount = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
        const questionScore = isCorrect ? (currentQuestion.score || 1) : 0;
        const newTotalScore = totalScore + questionScore;

        setCorrectAnswersCount(newCorrectCount);
        setTotalScore(newTotalScore);

        // Показываем фидбек
        setIsAnswerCorrect(isCorrect);
        setShowAnswerFeedback(true);
    };

    const proceedToNextQuestion = () => {
        setShowAnswerFeedback(false);
        setSelectedAnswer(null);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinishQuiz(totalScore + (isAnswerCorrect ? (questions[currentQuestionIndex].score || 1) : 0));
        }
    };

    const handleFinishQuiz = async (finalScore) => {
        try {
            const execution_date = new Date().toISOString().split('T')[0];
            const payload = {
                lesson_id: lessonId,
                student_id: user.id,
                current_score: finalScore,
                execution_date
            };

            const response = existingResultId
                ? await axios.put(`http://localhost:5000/api/task-complete/${existingResultId}`, payload)
                : await axios.post('http://localhost:5000/api/task-complete', payload);

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
                const questionsResponse = await axios.get(`http://localhost:5000/api/data/${lessonId}/questions`);
                setQuestions(questionsResponse.data);

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

    const handleContinue = () => {
        navigate(-1);
    };

    if (isLoading) return <div className="card">Загрузка...</div>;
    if (error) return <div className="card error">{error}</div>;
    if (questions.length === 0) return <div className="card">Нет вопросов для этого урока</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.answer;

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
                    <h2>{currentQuestion.question}</h2>
                    <ul className="notDot">
                        {currentQuestion.options.map((option, index) => {
                            let className = 'li-element';

                            if (showAnswerFeedback) {
                                if (index === correctAnswerIndex) {
                                    className += ' correct';
                                } else if (index === selectedAnswer && index !== correctAnswerIndex) {
                                    className += ' incorrect';
                                }
                            } else if (selectedAnswer === index) {
                                className += ' selected';
                            }

                            return (
                                <li
                                    key={index}
                                    className={className}
                                    onClick={() => handleAnswerSelect(index)}
                                >
                                    {option}
                                </li>
                            );
                        })}
                    </ul>

                    {showAnswerFeedback && (
                        <div className={`feedback ${isAnswerCorrect ? 'correct' : 'incorrect'}`}>
                            {isAnswerCorrect ? (
                                <p>Правильно! ✔️</p>
                            ) : (
                                <p>Неправильно. Правильный ответ: {currentQuestion.options[correctAnswerIndex]}</p>
                            )}
                            <button
                                className="button"
                                onClick={proceedToNextQuestion}
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Далее' : 'Завершить тест'}
                            </button>
                        </div>
                    )}

                    {!showAnswerFeedback && (
                        <div className="flex">
                            <button
                                className="button"
                                onClick={handleNextQuestion}
                                disabled={selectedAnswer === null}
                            >
                                Проверить ответ
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskPage;