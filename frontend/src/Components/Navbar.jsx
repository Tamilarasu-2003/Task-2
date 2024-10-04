import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Navbar1 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = localStorage.getItem('username');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        'Electronics',
        'Home_Appliances',
        'Clothing',
        'Books',
        'Toys',
        'Sports_Equipments',
    ];

    const handleLogout = () => {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        navigate(`/products?search=${searchTerm}`);
    };
    

    const handleCategoryChange = (e) => {
        const categoryName = e.target.value;
        setSelectedCategory(e.target.value);
        const lowerCaseCategoryName = categoryName.toLowerCase(); 
        console.log(categoryName);
        navigate(`/products?category=${lowerCaseCategoryName}`);


        
    };

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">

                {location.pathname === '/products' ?(
                    <div className="flex items-center space-x-4">
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="border border-gray-300 rounded-md p-2 ml-8 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="" disabled>Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category.toLowerCase()}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                ):(
                    <span className="text-xl font-semibold text-gray-900">Hello, {username}!</span>
                )}


                
                
                <div className="flex items-center space-x-4">
                    {location.pathname === '/products' ? (
                        <form onSubmit={handleSearch} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Search products..."
                                aria-label="Search products"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button 
                                type="submit" 
                                className="bg-indigo-600 text-white rounded-md p-2 hover:bg-indigo-700 transition duration-200"
                            >
                                Search
                            </button>
                        </form>
                    ) : (
                        <button 
                            className="bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition duration-200">
                                <Link to="/products">Products</Link>
                        </button>
                    )}
                    <button 
                        className="bg-red-600 text-white rounded-md py-2 px-4 hover:bg-red-700 transition duration-200"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>

    );
};

export default Navbar1;
