import { useState, useEffect } from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import Map from './components/map/Map'
import Login from './components/login/Login'


function App() {
  useEffect(()=>{},[]);

  return (
    <Routes>
      <Route path='/*'/>
      <Route path='/' Component={Map}/>
      <Route path='/login' Component={Login}/>
    </Routes>
  )
}

export default App;
