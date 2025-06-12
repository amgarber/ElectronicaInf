import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './index.css';
import Welcome from './Components/Welcome';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './Components/Home';
import AuthorizeEntry from './Components/AuthorizeEntry';
import Notifications from "./Components/Notifications";
import Profile from "./Components/Profile";
import MyAuthorizations from "./Components/MyAuthorizations";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/authorize-entry" element={<AuthorizeEntry />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/my-authorizations" element={<MyAuthorizations />} />
            </Routes>
        </Router>
    );
}

export default App;
