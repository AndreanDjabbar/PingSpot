'use client';
/* eslint-disable react/no-unescaped-entities */
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaPhoneAlt } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { useState } from "react";

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Daftar</h1>
                    <p className="text-sky-800">Buat akun untuk mulai menggunakan PingSpot</p>
                </div>

                <div className="space-y-5">
                    <div className="flex justify-between w-full gap-4">
                        <div className="w-1/2">
                            <div className="space-y-1">
                                <label htmlFor="fullname" className="block text-sm font-medium text-sky-800">
                                Nama Lengkap
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IoPersonSharp size={20}/>
                                    </div>
                                    <input
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                </div>
                            </div>
                            <div className="text-red-500 text-sm font-semibold mt-0.5">
                                
                            </div>
                        </div>
                        <div className="w-1/2">
                            <div className="space-y-1">
                                <label htmlFor="username" className="block text-sm font-medium text-sky-800">
                                Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IoPersonSharp size={20}/>
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                            </div>
                            <div className="text-red-500 text-sm font-semibold mt-0.5">
                                
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="space-y-1">
                            <label htmlFor="phone" className="block text-sm font-medium text-sky-800">
                            Nomor Telepon
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhoneAlt size={20}/>
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                    placeholder="Masukkan nomor telepon Anda"
                                />
                            </div>
                        </div>
                        <div className="text-red-500 text-sm font-semibold mt-0.5">
                            
                        </div>
                    </div>

                    <div>
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-sky-800">
                            Alamat Email
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
                                    placeholder="Masukkan email Anda"
                                />
                            </div>
                        </div>
                        <div className="text-red-500 text-sm font-semibold mt-0.5">
                            
                        </div>
                    </div>

                    <div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-sky-800">
                            Kata Sandi
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
                                    placeholder="Masukkan kata sandi Anda"
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
                        <div className="text-red-500 text-sm font-semibold mt-0.5">
                            
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800"
                    >
                        <div className="flex items-center space-x-2">
                            <span>Daftar</span>
                        </div>
                    </button>
                    </div>

                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-sky-800">Atau lanjutkan dengan</span>
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
                Sudah punya akun?{' '}
                <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Masuk
                </a>
                </p>
            </div>
        </AuthLayout>
        );
    };
export default RegisterPage;