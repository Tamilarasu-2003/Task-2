import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../../src/assets/bg-1.png";

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password match
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            // Change the endpoint to match your backend route for signup
            const response = await axios.post('http://localhost:5000/api/auth/signup', {
                username,
                email,
                password
            });

            // Check for successful signup
            if (response.status === 201) {
                alert('Signup successful');
                navigate('/login');
            }
        } catch (error) {
            // Handle error message from the backend if available
            const message = error.response?.data?.message || 'Signup failed';
            setErrorMessage(message);
        }
    };

    return (
        <div className="bg-gray-50 font-[sans-serif]">
            <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
                <div className="max-w-md w-full">
                    <img src={logo} alt="logo" className="w-60 mx-auto block" />
                    <div className="p-8 rounded-2xl bg-white shadow">
                        <h2 className="text-gray-800 text-center text-2xl font-bold">Create your account</h2>
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            {errorMessage && (
                                <div className="text-red-600 text-sm mb-4 text-center">
                                    {errorMessage}
                                </div>
                            )}
                            <div>
                                <label htmlFor="username" className="text-gray-800 text-sm mb-2 block">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required
                                    className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                                    placeholder="Enter username"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-gray-800 text-sm mb-2 block">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required
                                    autoComplete="email"
                                    className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="text-gray-800 text-sm mb-2 block">Password</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                        autoComplete="current-password"
                                        className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-gray-600"
                                    >
                                        <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="text-gray-800 text-sm mb-2 block">Confirm Password</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required
                                        className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-3 text-gray-600"
                                    >
                                        <i className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="!mt-8">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                >
                                    Sign Up
                                </button>
                            </div>
                            <p className="text-gray-800 text-sm !mt-8 text-center">
                                Already a member? <a href="/login" className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold">Sign in</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
