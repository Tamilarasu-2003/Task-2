import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Category from '../Components/category';
import Navbar1 from '../Components/Navbar';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const sessionToken = localStorage.getItem('sessionToken');
        const tokenExpiration = localStorage.getItem('tokenExpiration');

        // Check if token exists
        if (!sessionToken || !tokenExpiration || Date.now() > tokenExpiration) {
            localStorage.removeItem('sessionToken'); 
            localStorage.removeItem('tokenExpiration'); 
            navigate('/login'); 
            return;
        }

        
        const timeout = setTimeout(() => {
            localStorage.removeItem('sessionToken'); 
            localStorage.removeItem('tokenExpiration'); 
            navigate('/login'); 
        }, tokenExpiration - Date.now());

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <>
            <Navbar1 />
            <Category />
        </>
    );
};

export default Dashboard;
