'use client';
/* eslint-disable react/no-unescaped-entities */
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { Button, InputField, ErrorSection, SuccessSection } from "@/components";
import { useForm } from "react-hook-form";
import { ILoginRequest } from "@/types/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../Schema";
import { useLogin, useErrorToast, useSuccessToast } from "@/hooks";
import { getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage } from "@/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const router = useRouter();

    const { mutate, isPending, isError, isSuccess, error, data } = useLogin();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<ILoginRequest>({
        resolver: zodResolver(LoginSchema)
    });

    const onSubmit = (data: ILoginRequest) => {
        mutate({ ...data });
    };

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/main/home");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Masuk</h1>
                <p className="text-gray-800">Masuk ke akun Anda untuk melanjutkan</p>
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
                <>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                register={register("email")}
                                className="w-full"
                                withLabel={true}
                                labelTitle="Alamat Email"
                                icon={<MdMailOutline size={20} />}
                                placeHolder="Masukkan email Anda"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.email?.message as string}</div>
                        </div>
                        <div>
                            <InputField
                                id="password"
                                name="password"
                                type={'password'}
                                register={register("password")}
                                className="w-full"
                                withLabel={true}
                                labelTitle="Kata Sandi"
                                icon={<LuLockKeyhole size={20} />}
                                placeHolder="Masukkan kata sandi Anda"
                                showPasswordToggle={true}
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.password?.message as string}</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                            <a href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                                Lupa kata sandi?
                            </a>
                            </div>
                        </div>

                        <Button
                            className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium "
                            title="Masuk"
                            type="submit"
                            loadingText="Masuk..."
                            isLoading={isPending}
                        >
                            Masuk
                        </Button>

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
                    </form>
                    <p className="text-center text-sm text-gray-700">
                    Belum punya akun?{' '}
                    <a href="/auth/register" className="font-medium text-sky-700 hover:text-sky-800 transition-colors duration-200">
                        Daftar gratis
                    </a>
                    </p>
                </>
            )}
        
        </div>
        );
    };
export default LoginPage;