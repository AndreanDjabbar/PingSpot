'use client';
/* eslint-disable react/no-unescaped-entities */
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-sky-800">Login</h1>
                    <p className="text-sky-800">Sign in to your account to continue</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-sky-800">
                        Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdMailOutline size={20}/>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-sky-800">
                        Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuLockKeyhole size={20}/>
                            </div>
                            <input
                                id="password"
                                name="password"
                                required
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                placeholder="Enter your password"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                type="button"
                                className="text-sky-800"
                                onClick={() => setShowPassword(!showPassword)}
                                >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                            Forgot your password?
                        </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800"
                    >
                        <div className="flex items-center space-x-2">
                            <span>Login</span>
                        </div>
                    </button>
                    </div>

                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-sky-800">Or continue with</span>
                    </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-sky-800 transition-all duration-200"
                    >
                        <FaGoogle size={20}/>
                        <span className="ml-2">Google</span>
                    </button>
                    
                    <button
                        type="button"
                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-sky-800 transition-all duration-200"
                    >
                        <FaGithub size={20}/>
                        <span className="ml-2">GitHub</span>
                    </button>
                </div>
            
                <p className="text-center text-sm text-sky-800">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Sign up for free
                </a>
                </p>
            </div>
        </AuthLayout>
        );
    };
export default LoginPage;