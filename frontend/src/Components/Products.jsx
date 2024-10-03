import React, { useEffect, useState } from 'react';
import axios from 'axios';
import image1 from '../assets/img1.jpg';
import Navbar1 from '../Components/Navbar';
import PaginationButtons from './PaginationButtons';
import { useNavigate, useLocation } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const productsPerPage = 12;
    const navigate = useNavigate();
    const location = useLocation();



    

    const fetchProducts = async (page, category, search) => {
        try {
            let response;
            if (search) {
                // Fetch from Elasticsearch based on search term, including pagination
                response = await axios.get(`http://localhost:5000/products/search?query=${search}&page=${page}&limit=${productsPerPage}`);
            } else {
                // Fetch from PostgreSQL based on category
                response = await axios.get(`http://localhost:5000/products?page=${page}&limit=${productsPerPage}&category=${category}`);
            }
            setProducts(response.data.products);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || '';
        const search = queryParams.get('search') || '';

        fetchProducts(currentPage, category, search);


        const timeout = setTimeout(() => {
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('tokenExpiration');
            navigate('/login');
        }, tokenExpiration - Date.now());

        return () => clearTimeout(timeout);
    }, [currentPage, navigate, location.search]);

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPage(selectedPage);
        
        const queryParams = new URLSearchParams(location.search);
        const search = queryParams.get('search') || '';
        fetchProducts(selectedPage, '', search);
    };

    return (
        <>
            <Navbar1 />
            
            <div className="container mx-auto mt-5">
                <h2 className="text-center text-2xl font-bold mb-6">Products</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
                    {products.map((product) => (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105" key={product.id}>
                            <img 
                                src={product.image || image1}
                                alt={product.name}
                                className="w-full h-48 object-cover transition-transform duration-200 hover:scale-110" 
                            />
                            <div className="p-4 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 text-center">{product.name}</h3>
                                <div className="flex-grow text-center text-gray-600 mt-2">
                                    <p><strong>Category:</strong> {product.category}</p>
                                    <p><strong>Price:</strong> <span className="text-lg font-bold text-green-600">${product.price}</span></p>
                                    {product.offer_price && (
                                        <p className="text-red-500 line-through">${product.offer_price}</p>
                                    )}
                                    <p><strong>Brand:</strong> {product.specs.brand}</p>
                                    <p><strong>Model:</strong> {product.specs.model}</p>
                                    <p><strong>Features:</strong> {product.specs.features.join(', ')}</p>
                                </div>
                                <a 
                                    href={`/category/${product.category}`}
                                    className="mt-4 bg-blue-600 text-white rounded-md py-2 text-center hover:bg-blue-700 transition duration-200"
                                >
                                    Buy Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <PaginationButtons 
                onPageChange={handlePageClick}
                currentPage={currentPage}
                totalCount={totalCount}
                productsPerPage={productsPerPage}
            />
        </>
    );
}

export default Products;
