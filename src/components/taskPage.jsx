function TaskPage(){
    return <div className="profile-container">
        <h1>Викторина</h1>
        <div className="card">
            <div id="quiz-container">
                <h2 id="question">Вопрос 1: Какой язык программирования вы изучаете?</h2>
                <ul className="notDot">
                    <li className="li-element" data-answer="1">JavaScript</li>
                    <li className="li-element" data-answer="2">Python</li>
                    <li className="li-element" data-answer="3">Java</li>
                    <li className="li-element" data-answer="4">C++</li>
                </ul>
                <div className="flex">
                    <button id="next-button" className="button">Далее</button>
                    <button id="finish-button" className="button">Закончить</button>
                </div>
                <p id="result"></p>
            </div>
        </div>
    </div>
}

export default TaskPage;
