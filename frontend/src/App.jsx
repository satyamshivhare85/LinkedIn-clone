import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signup from './pages/signup.jsx';
import Login from './pages/login.jsx';
import { UserDataContext } from './context/userContext.jsx';
import Network from './pages/Network.jsx'; // icon nahi, actual page


function App() {
  let  {userData}= useContext(UserDataContext)
  return (
    <Routes>
      <Route path='/' element={userData?<Home/>: <Navigate to="/login"/>} />
      <Route path='/signup' element={userData?<Navigate to="/"/>: <Signup/>} />
      <Route path='/login' element={userData?<Navigate to="/"/>: <Login/>} />
<Route path='/network' element={userData ? <Network /> : <Navigate to="/login" />} />


      
    </Routes>
  );
}

export default App;
