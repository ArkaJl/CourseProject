import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from "./components/authPage.jsx";
import {useState} from "react";

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
                            <a className="card">Welcome, {user.login} ({user.role}!)</a>

                        </div>
                    ) : (
                        <div className="center">
                        <Link className="li-element" to="/login">Login</Link>
                            <Link className="li-element" to="/register">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/lol" /> : <AuthPage user={user} setUser={setUser}/>}/>
            </Routes>
        </Router>
    )
}

export default App;