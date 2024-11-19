
import { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate  } from 'react-router-dom';
import HomePage from './components/homePage/HomePage';
import PageNotFound from './components/pageNotFound/PageNotFound';
import Map from './components/map/Map';
import Login from './components/login/Login';
import Link from './components/link/Link';
import AuthAPI from './api/authAPI';

import "./App.css";
import DocList from "./components/DocumentList/DocList";

function App() {
  const [user, setUser] = useState(null); // Consolidato `user` e `userRole`
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthAPI.getUserInfo();
        if (user) {
          setLoggedIn(true);
          setUser(user);
        } else {
          console.log("User is not logged in");
        }
      } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
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
        return user;
      }
    } catch (err) {
      console.error("Errore nel login:", err.message);
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
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Errore nel logout:", err.message);
    }
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          loggedIn ? (
            <Navigate replace to="/homePage" />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
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
        element={
          loggedIn ? <Navigate replace to="/" /> : <Login login={handleLogin} />
        }
      />
      <Route path="/DocumentList" element={<DocList />} />

      {/*<Route path='/link' element={<Link />} /> {/* Add the Link component route */}
    </Routes>
  );
}

export default App;
