import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './index.css';
import Welcome from './Components/Welcome';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './Components/Home';
import AuthorizeEntry from './Components/AuthorizeEntry';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/authorize-entry" element={<AuthorizeEntry />} />
            </Routes>
        </Router>
    );
}

export default App;
