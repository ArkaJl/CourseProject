import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from "./components/authPage.jsx";
import {Fragment, useState, useEffect} from "react";
import RegistryPage from "./components/registryPage.jsx";
import CourseListPage from "./components/courseListPage.jsx";
import Categories from "./components/categories.jsx";
import LessonsPage from "./components/lessonsPage.jsx";
import SearchPage from "./components/searchPage.jsx";
import ProfilePage from "./components/profilePage.jsx";
import ClassesPage from "./components/classPages/classesPage.jsx";
import CoursesListByTeacherPage from "./components/coursesListByTeacherPage.jsx";
import TaskPage from "./components/taskPage.jsx";
import TeacherPanel from "./components/createLessonPage.jsx";
import CourseManagementPage from "./components/CourseManagement.jsx";
import ClassStudents from "./components/classPages/ClassStudents.jsx";
import StudentProgress from "./components/classPages/StudentProgress.jsx";
import TeachersCourses from "./components/classPages/TeachersCourses.jsx";

function App() {
    const [user, setUser] = useState(null); // залогиненый юзер

    // При монтировании компонента проверяем localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
    }, []);

    const logOut = () => {
        localStorage.removeItem('user');
        setUser(null);
    }

    // Обновляем localStorage при изменении пользователя
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);


    return (
        <Router>
            <nav>
                <Link to="/categories" className="center link">
                    <img className="logo" src="src/assets/logo.png" alt="logo"/>
                    <h2>LightLingo</h2>
                </Link>

                {user ? (<div className="center">
                        <Link to="/profile" className="center padding-left-right"><h3>Профиль</h3></Link>
                        <Link to="/classes" className="center padding-left-right"><h3>Классы</h3></Link>
                        <Link to="/search" className="center padding-left-right"><h3>Поиск курсов</h3></Link>
                        {user.role === "teacher" ? <Link to="/create-lesson" className="li-element padding-left-right"><h3>Создать урок</h3></Link> : null}
                        {user.role === "teacher" ? <Link to="/manage-courses" className="li-element padding-left-right"><h3>Управление курсами</h3></Link> : null}
                    </div>
                ) : (
                    <Fragment></Fragment>
                )}

                <div className="container flex-right">
                    {user ? (
                        <div className="center padding-left-right">
                            <Link className="li-element" to="/" onClick={logOut}>Выйти</Link>
                            <a className="card">Welcome, {user.username} ({user.role}!)</a>
                        </div>
                    ) : (
                        <div className="center padding-left-right">
                            <Link className="li-element" to="/login">Войти</Link>
                            <Link className="li-element" to="/register">Зарегистрироваться</Link>
                        </div>
                    )}
                </div>
            </nav>

            <div className="container">
                {user ? <Fragment />
                    : (
                        <div className="card form-container">
                            <h2>Добро пожаловать на стартовую страницу!</h2>
                            <p><Link to="/login" className="link" style={{color: 'yellow'}}>Войдите</Link> или <Link to="/register" className="link" style={{color: 'yellow'}}>зарегистрируйтесь</Link>, чтобы продолжить!</p>
                        </div>
                    )}
            </div>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/categories"/> : <AuthPage setUser={setUser}/>}/>
                <Route
                    path="/register"
                    element={user ? null : <RegistryPage/>}
                />
                <Route
                    path="/profile"
                    element={user ? <ProfilePage user={user}/> : <Fragment/>}
                />
                <Route
                    path="/classes"
                    element={user ? <ClassesPage user={user}/> : <Fragment/>}
                />
                <Route
                    path="/byTeacher/:teacherId/courses"
                    element={user ? <CoursesListByTeacherPage /> : <Fragment/>}
                />
                <Route
                    path="/search"
                    element={user ? <SearchPage/> : <Fragment></Fragment>}
                />
                <Route
                    path="/courses"
                    element={user ? <CourseListPage/> : <Fragment />}
                />
                <Route
                    path="/categories"
                    element={<Categories user={user}/>}
                />
                <Route
                    path="/categories/:categoryId/courses"
                    element={<CourseListPage/>}
                />
                <Route
                    path="/courses/:courseId/lessons"
                    element={user? <LessonsPage user={user}/> : null}
                />
                <Route
                    path="/lessons/:lessonId/questions"
                    element={user? <TaskPage user={user}/> : <Fragment/>}
                />
                <Route
                    path="/create-lesson"
                    element={user?.role === 'teacher' ? <TeacherPanel user={user} /> : <Navigate to="/you-not-teacher!" />}
                />
                <Route
                    path="/manage-courses"
                    element={user?.role === 'teacher' ? <CourseManagementPage user={user} /> : <Navigate to="/" />}
                />
                <Route
                    path="/teacher/classes/:classId/students"
                    element={user?.role === 'teacher' ? <ClassStudents /> : <Navigate to="/" />}
                />
                <Route
                    path="/teacher/students/:studentId/progress"
                    element={user?.role === 'teacher' ? <StudentProgress /> : <Navigate to="/" />}
                />
                <Route
                    path="/classes/:teacherId/courses"
                    element={<TeachersCourses />}
                />
            </Routes>
            <footer>
                <p>Выполнил студент колледжа Царицыно <br/><b>Алексеев Антоний</b></p>
            </footer>
        </Router>
    )
}

export default App;
