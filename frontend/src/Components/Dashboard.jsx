import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Category from '../Components/category';
import Navbar1 from '../Components/Navbar';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const sessionToken = localStorage.getItem('sessionToken');
        const tokenExpiration = localStorage.getItem('tokenExpiration');

        // Check if token exists and is valid
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

        // Fetch categories from the API
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories', {
                    headers: {
                        'Authorization': `Bearer ${sessionToken}` // Include token in request headers
                    }
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <>
            <Navbar1 />
            <Category categories={categories} /> {/* Pass categories as props */}
        </>
    );
};

export default Dashboard;
