import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Page/login';
import Home from './Page/home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
