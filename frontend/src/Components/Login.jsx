import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../../src/assets/bg-1.png";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/signin', { email, password });
            const token = response.data.token;
            const expirationTime = Date.now() + (60 * 60 * 1000);

            localStorage.setItem('sessionToken', token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('tokenExpiration', expirationTime);

            navigate('/dashboard'); 
        } catch (error) {
            alert('Signin failed');
        }
    };

    return (
        <div className="bg-gray-50 font-[sans-serif]">
            <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
                <div className="max-w-md w-full">
                    <img src={logo} alt="logo" className="w-60 mb-8 mx-auto block" />
                    <div className="p-8 rounded-2xl bg-white shadow">
                        <h2 className="text-gray-800 text-center text-2xl font-bold">Sign in</h2>
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">Email address</label>
                                <div className="relative flex items-center">
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
                            </div>
                            <div>
                                <label className="text-gray-800 text-sm mb-2 block">Password</label>
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
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-800">Remember me</label>
                                </div>
                            </div>
                            <div className="!mt-8">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                >
                                    Sign in
                                </button>
                            </div>
                            <p className="text-gray-800 text-sm !mt-8 text-center">
                                Don't have an account? <a href="/signup" className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold">Register here</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
