import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from "./components/authPage.jsx";
import {Fragment, useState} from "react";
import RegistryPage from "./components/registryPage.jsx";
import CourseListPage from "./components/courseListPage.jsx";
import Categories from "./components/categories.jsx";
import LessonsPage from "./components/lessonsPage.jsx";
import SearchPage from "./components/searchPage.jsx";
import ProfilePage from "./components/profilePage.jsx";

function App() {
    const [user, setUser] = useState(null); //залогиненый юзер

    const logOut = () => {
        setUser(null);
    }
    const loginForTest = () =>{
        setUser("dad");
    }

    return (
        <Router>
            <nav>
                <Link to="/categories" className="center link">
                    <img className="logo" src="src/assets/logo.png" alt="logo"/>
                    <h2>LightLingo</h2>
                </Link>


                {user ? (<div className="center">
                    <Link to="/profile" className="center padding-left-right"><h3>Profile</h3></Link>
                    <Link to="/chievements" className="center padding-left-right"><h3>Achievements</h3></Link>
                    <Link to="/search" className="center padding-left-right"><h3>Search Courses</h3></Link>
                    </div>
                ):(
                    <Fragment></Fragment>
                )}

                {/*кнопки войти и зарегистрироваться*/}
                <div className="container flex-right">
                    {user ? (
                        <div className="center padding-left-right">
                            <Link className="li-element" to="/" onClick={logOut}>Logout</Link>
                            <a className="card">Welcome, {user.username} ({user.role}!)</a>
                        </div>
                    ) : (
                        <div className="center padding-left-right">
                            <Link className="li-element" to="/login">Login</Link>
                            <Link className="li-element" to="/register">Register</Link>
                            <Link className="li-element" to="/categories" onClick={loginForTest}>login for test</Link>
                        </div>
                    )}
                </div>

            </nav>

            {/*Приветствие*/}
            <div className="container">
                {user ? <Fragment />
                     : (
                    <div className="card form-container">
                        <h2>Welcome to The Start Page!</h2>
                        <p><u>Log in </u>or <u>register</u> to continue !</p>
                    </div>
                )}
            </div>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/categories"/> : <AuthPage setUser={setUser}/>}/>
                <Route
                    path="/register"
                    element={user ? <Navigate to="/categories"/> : <RegistryPage setUser={setUser}/>}
                />
                <Route
                    path="/profile"
                    element={user ? <ProfilePage user={user}/> : <Fragment/>}
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
                    element={<Categories/>}
                />
                <Route
                    path="/categories/:categoryId/courses"
                    element={<CourseListPage/>}
                />
                <Route
                    path="/courses/:courseId/lessons"
                    element={<LessonsPage/>}
                />
            </Routes>
            <footer>
                <p>Выполнил студент колледжа Царицыно <br/><b>Алексеев Антоний</b></p>
            </footer>
        </Router>
    )
}

export default App;
