import React, { useEffect, useState } from 'react';
import axios from 'axios';
import image1 from '../../src/assets/img1.jpg';
import Products from './Products';
import { useNavigate } from 'react-router-dom';


const Category = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        const lowerCaseCategoryName = categoryName.toLowerCase(); 
        console.log(categoryName);
        navigate(`/products?category=${lowerCaseCategoryName}`);
    };
  
    return (
<div className="container mx-auto mt-5">
    <h2 className="text-2xl font-bold text-center mb-6">Categories</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer" key={category.id} onClick={() => handleCategoryClick(category.name)}>
                <img 
                    src={image1} 
                    alt={category.name} 
                    className="w-full h-48 object-cover transition-transform duration-200 hover:scale-110" 
                />
                <div className="p-4 flex flex-col h-full">
                    <h3 className="text-xl font-semibold text-center text-gray-800">{category.name}</h3>
                    <p className="flex-grow text-center text-gray-600 mb-4">{category.description}</p>
                    <a 
                        href={`/category/${category.name}`} 
                        className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition duration-200"
                    >
                        Show All
                    </a>
                </div>
            </div>
        ))}
    </div>
</div>

    );
}

export default Category;
