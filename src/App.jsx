import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from "./components/authPage.jsx";
import {useState} from "react";
import RegistryPage from "./components/registryPage.jsx";

function App() {
    const [user, setUser] = useState(null); //залогиненый юзер

    return (
        <Router>
            <nav>
                <div className="center">
                    <img className="logo" src="src/assets/logo.png" alt="logo"/>
                    <h2>LightLingo</h2>
                </div>
                <div className="container flex-right">
                    {user ? (
                        <div className="center">
                            <button className="li-element">Logout</button>
                            <a className="card">Welcome, {user.username} ({user.role}!)</a>
                        </div>
                    ) : (
                        <div className="center">
                            <Link className="li-element" to="/login">Login</Link>
                            <Link className="li-element" to="/register">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
            <div className="container flex-center">
                {user ? (<div className="card">

                    </div>
                ) : (
                    <div className="card form-container">
                        <h2>Welcome to The Start Page!</h2>
                        <p><u>Log in </u>or <u>register</u> to continue !</p>
                    </div>
                )}
            </div>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/"/> : <AuthPage setUser={setUser}/>}/>
                <Route
                    path="/register"
                    element={user ? <Navigate to="/"/> : <RegistryPage setUser={setUser}/>}
                />
                {/*<Route*/}
                {/*    path="/"*/}
                {/*    element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}*/}
                {/*/>*/}
            </Routes>
            <footer>
                <p>Выполнил студент колледжа Царицыно <br/><b>Алексеев Антоний</b></p>
            </footer>
        </Router>
    )
}

export default App;