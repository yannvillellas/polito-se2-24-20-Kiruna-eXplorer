
import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import MainPage from './components/mainPage/MainPage';
import HomePage from './components/homePage/HomePage';
import PageNotFound from './components/pageNotFound/PageNotFound';
import Map from './components/homePage/map/Map';
import Login from './components/authentication/Login';
import Registration from './components/authentication/Registration';
import Header from './components/header/Header';
import AuthAPI from './api/authAPI';
import UserAPI from './api/userAPI';
import DocList  from "./components/documentList/DocList";
import DocSpecificList from "./components/documentList/DocSpecificList";


function App() {
    const [user, setUser] = useState(null);  // Consolidato `user` e `userRole`
    const [authChecked, setAuthChecked] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isUrbanPlanner, setIsUrbanPlanner] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await AuthAPI.getUserInfo();
                if (user) {
                    setLoggedIn(true);
                    setUser(user);
                    setIsUrbanPlanner(user.role === 'urbanPlanner');
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
                setIsUrbanPlanner(user.role === 'urbanPlanner');
                return user;
            }
        } catch (err) {
            console.error("Login error:", err.message);
            return null;
        }
    };

    const handleLogout = async () => {
        try {
            if (loggedIn) {
                const response = await AuthAPI.logOut();
                if (response) {
                    setLoggedIn(false);
                    setUser(null);
                    setIsUrbanPlanner(false);

                    navigate('/mainPage');
                }
            } else {
                navigate('/mainPage');
            }
        } catch (err) {
            console.error("Logout error:", err.message);
        }
    };

    const handleRegistration = async (credentials) => {
        try {
            const newUser = await UserAPI.createUser(credentials);
            if (newUser) {
                console.log("Registration successful:");
                const response = await AuthAPI.logIn(credentials)
                if (response) {
                    setUser(newUser)
                    setLoggedIn(true);
                    setIsUrbanPlanner(true);
                    navigate('/homePage');
                } else {
                    console.log("errore durante il login")
                    navigate('/login')
                }
            }
        } catch (err) {
            console.error("Registration error:", err.message);
        }
    };

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
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

                <Route path="/" element={<Navigate replace to={loggedIn ? '/homePage' : '/mainPage'} />} />
                <Route
                    path="/login"
                    element={loggedIn ? <Navigate replace to="/" /> : <Login login={handleLogin} />}
                />
                <Route path="/registration" element={<Registration registration={handleRegistration} />} />
                <Route path="/map" element={<Map role={user?.role} />} />
                <Route path="*" element={<PageNotFound />} />
                <Route path='/mainPage' element={<MainPage loggedIn={loggedIn} role={user?.role} handleLogout={handleLogout} isUrbanPlanner={isUrbanPlanner} />} />
                <Route path='/homePage' element={<HomePage loggedIn={loggedIn} role={user?.role} handleLogout={handleLogout} isUrbanPlanner={isUrbanPlanner} />} />
                <Route path="/documentPage" element={<DocList />} />
                <Route path="/documentPage/:docId" element={<DocSpecificList />} />
                

            </Route>
        </Routes>
    );
}

export default App;
