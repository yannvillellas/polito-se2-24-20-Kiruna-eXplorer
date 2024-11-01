import { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Row, Col, Button, Form } from "react-bootstrap";
import Map from "./components/map/Map";
import Login from "./components/login/Login";
import FirstPage from "./components/firstPage";
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
  useEffect(() => {}, []);

  return (
    <Routes>
      <Route path="/*" />
      <Route path="/" Component={Map} />
      <Route path="/login" Component={Login} />
      <Route path="/firstPage" Component={FirstPage} />
    </Routes>
  );
}

export default App;
