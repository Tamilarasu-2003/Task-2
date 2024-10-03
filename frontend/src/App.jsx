import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Category from './Components/category';
import Products from './Components/Products';
import Navbar1 from './Components/Navbar';
import './index.css'

const App = () => {
    
    return (
        <BrowserRouter>
            
            <Routes>
                <Route path="/" element={<Navigate to="/Login" />} />
                <Route path="/SignUp" element={<Signup />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Categories" element={<Category/>}/>
                <Route path="/products" element={<Products/>}/>

                <Route path="/Navbar" element={<Navbar1/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
