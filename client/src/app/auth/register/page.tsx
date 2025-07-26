"use client";
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle, FaGithub, FaPhoneAlt } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { IRegisterFormType } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../Schema";
import { useRegister } from "@/hooks/auth/useRegister";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";

const RegisterPage = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IRegisterFormType>({
        resolver: zodResolver(RegisterSchema)
    });
    const { mutate, isPending, isError, isSuccess, error } = useRegister();
    const { toastSuccess, toastError } = useToast();

    useEffect(() => {
        {console.log("Effect triggered for registration status changes");}
        if (isError && error) {
            toastError(error?.message || "Terjadi kesalahan saat proses registrasi.");
        }
        if (isSuccess) {
            toastSuccess("Registrasi berhasil! Silakan cek email Anda atau langsung login.");
        }
    }, [isError, isSuccess, error, toastError, toastSuccess]);

    const onSubmit = (data: IRegisterFormType) => {
        mutate(data);
    };

    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Daftar</h1>
                    <p className="text-sky-800">Buat akun untuk mulai menggunakan PingSpot</p>
                </div>

                {isSuccess && (
                    <div className="text-green-600 font-semibold text-center bg-green-100 rounded px-4 py-2">
                        Registrasi berhasil! Silakan cek email Anda atau langsung <a href="/auth/login" className="underline text-blue-600">login</a>.
                    </div>
                )}

                {isError && (
                    <div className="text-red-600 font-semibold text-center bg-red-100 rounded px-4 py-2">
                        {error?.message}
                    </div>
                )}

                {!isSuccess && (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex justify-between w-full gap-4">
                        <div className="w-1/2">
                            <InputField
                                id="fullName"
                                register={register("fullName")}
                                type="text"
                                className="w-full"
                                withLabel={true}
                                labelTitle="Nama Lengkap"
                                icon={<IoPersonSharp size={20}/>} 
                                placeHolder="Masukkan nama lengkap Anda"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div>
                        </div>
                        <div className="w-1/2">
                            <InputField
                                id="username"
                                register={register("username")}
                                type="text"
                                className="w-full"
                                withLabel={true}
                                labelTitle="Username"
                                icon={<IoPersonSharp size={20}/>} 
                                placeHolder="Masukkan username"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.username?.message as string}</div>
                        </div>
                    </div>

                    <div>
                        <InputField
                            id="phone"
                            register={register("phone")}
                            type="tel"
                            className="w-full"
                            withLabel={true}
                            labelTitle="Nomor Telepon"
                            icon={<FaPhoneAlt size={20}/>} 
                            placeHolder="Masukkan nomor telepon Anda"
                        />
                        <div className="text-red-500 text-sm font-semibold">{errors.phone?.message as string}</div>
                    </div>

                    <div>
                        <InputField
                            id="email"
                            register={register("email")}
                            type="email"
                            className="w-full"
                            withLabel={true}
                            labelTitle="Alamat Email"
                            icon={<MdMailOutline size={20}/>} 
                            placeHolder="Masukkan email Anda"
                        />
                        <div className="text-red-500 text-sm font-semibold">{errors.email?.message as string}</div>
                    </div>

                    <div>
                        <InputField
                            id="password"
                            register={register("password")}
                            type="password"
                            className="w-full"
                            withLabel={true}
                            labelTitle="Kata Sandi"
                            icon={<LuLockKeyhole size={20}/>} 
                            placeHolder="Masukkan kata sandi Anda"
                            showPasswordToggle={true}
                        />
                        <div className="text-red-500 text-sm font-semibold">{errors.password?.message as string}</div>
                    </div>

                    <div>
                        <InputField
                            id="passwordConfirmation"
                            register={register("passwordConfirmation")}
                            type="password"
                            className="w-full"
                            withLabel={true}
                            labelTitle="Konfirmasi Kata Sandi"
                            icon={<LuLockKeyhole size={20}/>} 
                            placeHolder="Masukkan ulang kata sandi Anda"
                            showPasswordToggle={true}
                        />
                        <div className="text-red-500 text-sm font-semibold">{errors.passwordConfirmation?.message as string}</div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                        disabled={isPending}
                    >
                        <div className="flex items-center space-x-2">
                            {isPending && <span className="loader mr-2"></span>}
                            <span>{isPending ? "Mendaftar..." : "Daftar"}</span>
                        </div>
                    </button>
                </form>
                )}

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