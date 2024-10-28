import React, { useState } from "react";
import "./login.css";

function Login({ login }) {  // Destruttura `login` direttamente dai props
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const credentials = { username, password };

        try {
            const user = await login(credentials);
            if (!user) {
                setError('Credenziali errate.');
                setTimeout(() => setError(''), 2000); // Rimuove l'errore dopo 2 secondi
            }
        } catch (err) {
            setError("Errore durante il login.");
            console.error("Login error:", err); // Log dell'errore
        }
    };

    return (
        <div className="wrapper">
            <div className="login_box">
                <div className="login-header">
                    <span>Login</span>
                </div>
                
                <form onSubmit={handleLogin}>
                    <div className="input_box">
                        <input
                            type="text"
                            id="user"
                            className="input-field"
                            placeholder=""
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="user" className="label">Username</label>
                        <i className="bx bx-user icon"></i>
                    </div>

                    <div className="input_box">
                        <input
                            type="password"
                            id="pass"
                            className="input-field"
                            placeholder=""
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="pass" className="label">Password</label>
                        <i className="bx bx-lock-alt icon"></i>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <div className="input_box">
                        <button type="submit" className="input-submit">Login</button>
                    </div>
                </form>

                <div className="guest">
                    <span>Don't have an account? <a href="http://localhost:5173/map">Continue as guest</a></span>
                </div>
            </div>
        </div>
    );
}

export default Login;
