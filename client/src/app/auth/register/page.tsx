'use client';
/* eslint-disable react/no-unescaped-entities */
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle, FaGithub, FaPhoneAlt } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import InputField from "@/components/form/InputField";

const RegisterPage = () => {
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
                            <InputField
                                id="fullname"
                                name="fullname"
                                type="text"
                                required
                                className="w-full"
                                withLabel={true}
                                labelTitle="Nama Lengkap"
                                icon={<IoPersonSharp size={20}/>} 
                                placeHolder="Masukkan nama lengkap Anda"
                            />
                            <div className="text-red-500 text-sm font-semibold mt-0.5"></div>
                        </div>
                        <div className="w-1/2">
                            <InputField
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full"
                                withLabel={true}
                                labelTitle="Username"
                                icon={<IoPersonSharp size={20}/>} 
                                placeHolder="Masukkan username"
                            />
                            <div className="text-red-500 text-sm font-semibold mt-0.5"></div>
                        </div>
                    </div>

                    <InputField
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full"
                        withLabel={true}
                        labelTitle="Nomor Telepon"
                        icon={<FaPhoneAlt size={20}/>} 
                        placeHolder="Masukkan nomor telepon Anda"
                    />
                    <div className="text-red-500 text-sm font-semibold mt-0.5"></div>

                    <InputField
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full"
                        withLabel={true}
                        labelTitle="Alamat Email"
                        icon={<MdMailOutline size={20}/>} 
                        placeHolder="Masukkan email Anda"
                    />
                    <div className="text-red-500 text-sm font-semibold mt-0.5"></div>

                    <InputField
                        id="password"
                        name="password"
                        type={"password"}
                        required
                        className="w-full"
                        withLabel={true}
                        labelTitle="Kata Sandi"
                        icon={<LuLockKeyhole size={20}/>} 
                        placeHolder="Masukkan kata sandi Anda"
                        showPasswordToggle={true}
                    />
                    <div className="text-red-500 text-sm font-semibold mt-0.5"></div>

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