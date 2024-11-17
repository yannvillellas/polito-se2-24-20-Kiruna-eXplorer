import { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import PageNotFound from './components/pageNotFound/PageNotFound';
import Map from './components/map/Map';
import Login from './components/login/Login';
import Header from './components/header/Header';
import AuthAPI from './api/authAPI';

import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isUrbanPlanner, setIsUrbanPlanner] = useState(false);
    const navigate = useNavigate();

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await AuthAPI.getUserInfo();
                if (user) {
                    setLoggedIn(true);
                    setUser(user);
                    setIsUrbanPlanner(user.role === 'urban_planner');
                } else {
                    console.log('User is not logged in');
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setUser(null);
            } finally {
                setAuthChecked(true);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const user = await AuthAPI.logIn(credentials);
            if (user) {
                setLoggedIn(true);
                setUser(user);
                setIsUrbanPlanner(user.role === 'urban_planner');
                return user;
            }
        } catch (err) {
            console.error("Login error:", err.message);
            return null;
        }
    };

    const handleLogout = async () => {
        try {
            const response = await AuthAPI.logOut();
            if (response) {
                setLoggedIn(false);
                setUser(null);
                setIsUrbanPlanner(false);
                navigate('/login');
            }
        } catch (err) {
            console.error("Logout error:", err.message);
        }
    };

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            {/* Layout with Header */}
            <Route
                element={
                    <>
                        <Header
                            loggedIn={loggedIn}
                            handleLogout={handleLogout}
                            isUrbanPlanner={isUrbanPlanner}
                        />
                        <Outlet />
                    </>
                }
            >
                {/* Routes */}
                <Route path="/" element={<Navigate replace to={loggedIn ? '/map' : '/login'} />} />
                <Route
                    path="/homePage"
                    element={
                        loggedIn ? (
                            <HomePage
                                loggedIn={loggedIn}
                                role={user?.role}
                                handleLogout={handleLogout}
                            />
                        ) : (
                            <PageNotFound />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={loggedIn ? <Navigate replace to="/" /> : <Login login={handleLogin} />}
                />
                <Route path="/map" element={<Map role={user?.role} />} />
                <Route path="*" element={<PageNotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
