import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import UserAPI from "../../api/userAPI";
import "./login.css";

function Registration({registration}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();


    const handleRegistration = async (e) => {
        e.preventDefault();
        
    
        const error = validatePassword(password, repeatPassword);
        if (error) {
            setError(error);
            setTimeout(() => setError(''), 2000);
        } else {
            const credentials = { username, password };
            const user = await registration(credentials)
            if(user){
                setError("Registration successful.");
                setTimeout(() => setError(''), 2000);
            }
        }
    };

    const validatePassword = (password, repeatPassword) => {
        const minLength = 8; // Lunghezza minima
        const maxLength = 32; // Lunghezza massima opzionale
        const hasUpperCase = /[A-Z]/.test(password); // Almeno una lettera maiuscola
        const hasLowerCase = /[a-z]/.test(password); // Almeno una lettera minuscola
        const hasNumber = /\d/.test(password); // Almeno un numero
        const hasSpecialChar = /[!@#$%^&*(),_.?":{}|<>]/.test(password); // Almeno un carattere speciale
        const noSpaces = /^\S+$/.test(password); // Nessuno spazio bianco
    
        if (!password || !repeatPassword) {
            return "Both password fields are required.";
        }
    
        if (password !== repeatPassword) {
            return "Passwords do not match.";
        }
    
        if (password.length < minLength) {
            return `Password must be at least ${minLength} characters long.`;
        }
    
        if (password.length > maxLength) {
            return `Password must be no more than ${maxLength} characters long.`;
        }
    
        if (!hasUpperCase) {
            return "Password must include at least one uppercase letter.";
        }
    
        if (!hasLowerCase) {
            return "Password must include at least one lowercase letter.";
        }
    
        if (!hasNumber) {
            return "Password must include at least one number.";
        }
    
        if (!hasSpecialChar) {
            return "Password must include at least one special character.";
        }
    
        if (!noSpaces) {
            return "Password must not contain spaces.";
        }
    
        return null;
    };
    

    return (
        <div className="wrapper">
            <div className="login_box">
                <div className="login-header">
                    <span>Sign-up</span>
                </div>
                
                <form onSubmit={handleRegistration}>
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
                            type={showPassword ? "text" : "password"}
                            id="pass"
                            className="input-field"
                            placeholder=""
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="pass" className="label">Password</label>
                        <i 
                            className={showPassword ? "bx bx-lock-open-alt icon" : "bx bx-lock-alt icon"} // Cambia icona
                            onClick={() => setShowPassword(!showPassword)} // Cambia visibilità della password al clic
                            style={{ cursor: "pointer" }}
                        />
                    </div>

                    <div className="input_box">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="repeatPass"
                            className="input-field"
                            placeholder=""
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            required
                        />
                        <label htmlFor="pass" className="label">Repeat Password</label>
                        <i 
                            className={showPassword ? "bx bx-lock-open-alt icon" : "bx bx-lock-alt icon"}
                            onClick={() => setShowPassword(!showPassword)} 
                            style={{ cursor: "pointer" }}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <div className="input_box">
                        <button type="submit" className="input-submit">Sign-Up</button>
                    </div>
                </form>

                <div className="guest">
                    <span>Have an account? <a href="http://localhost:5173/login">Sign-in</a></span>
                </div>
            </div>
        </div>
    );
}

export default Registration;