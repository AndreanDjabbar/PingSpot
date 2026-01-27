"use client";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { Button, InputField } from "@/components";
import { useForm } from "react-hook-form";
import { IRegisterRequest } from "@/types/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../Schema";
import { useRegister, useErrorToast, useSuccessToast } from "@/hooks";
import { useEffect } from "react";
import { getErrorResponseDetails, getErrorResponseMessage, getDataResponseMessage } from "@/utils";
import { useRouter } from "next/navigation";
import { SuccessSection, ErrorSection } from "@/components/feedback";

const RegisterPage = () => {
    const router = useRouter();

    const { mutate, isPending, isError, isSuccess, error, data } = useRegister();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IRegisterRequest>({
        resolver: zodResolver(RegisterSchema)
    });

    const onSubmit = (data: IRegisterRequest) => {
        mutate({ ...data, provider: "EMAIL" });
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    return (
        <div className="space-y-8 mb-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Daftar</h1>
                <p className="text-gray-800">Buat akun untuk mulai menggunakan PingSpot</p>
            </div>

            {isSuccess && (
                <SuccessSection message={getDataResponseMessage(data)}/>
            )}

            {isError && (
                <ErrorSection 
                message={getErrorResponseMessage(error)} 
                errors={getErrorResponseDetails(error)}/>
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

                    <Button
                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium"
                        title="Daftar"
                        loadingText="Mendaftar..."
                        isLoading={isPending}
                    >
                        Daftar
                    </Button>
                </form>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-700">Atau lanjutkan dengan</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <button
                    type="button"
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-sky-700 transition-all duration-300"
                    onClick={() => window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || ''}
                >
                    <FaGoogle size={20}/>
                    <span className="ml-2">Google</span>
                </button>
            </div>
            <p className="text-center text-sm text-gray-700">
                Sudah punya akun?{' '}
                <a href="/auth/login" className="font-medium text-sky-700 hover:text-sky-800 transition-colors duration-200">
                    Masuk
                </a>
            </p>
        </div>
    );
};
export default RegisterPage;