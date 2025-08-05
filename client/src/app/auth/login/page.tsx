'use client';
/* eslint-disable react/no-unescaped-entities */
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { FaGoogle, FaGithub } from "react-icons/fa";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { ILoginFormType } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../Schema";
import { useLogin } from "@/hooks/auth/useLogin";
import ButtonSubmit from "@/components/form/ButtonSubmit";
import ErrorSection from "@/components/UI/ErrorSection";
import SuccessSection from "@/components/UI/SuccessSection";
import { getDataResponseDetails, getDataResponseMessage } from "@/utils/getDataResponse";
import { getErrorResponseDetails, getErrorResponseMessage } from "@/utils/gerErrorResponse";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<ILoginFormType>({
        resolver: zodResolver(LoginSchema)
    });
    const { toastSuccess, toastError } = useToast();
    const { mutate, isPending, isError, isSuccess, error, data } = useLogin();
    const router = useRouter();
    const errorRef = useRef<string | null>(null);
    
    useEffect(() => {
        if (isError && error) {
            const currentError = getErrorResponseMessage(error);
            if (errorRef.current !== currentError) {
                toastError(currentError);
                errorRef.current = currentError;
            }
        }
        if (isSuccess && data) {
            toastSuccess(getDataResponseMessage(data));
            const token = getDataResponseDetails(data)?.token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            const jwtExpiration = payload.exp || 0;
            if (token) {
                document.cookie = `auth_token=${token}; path=/; expires=${new Date(jwtExpiration * 1000).toUTCString()}; secure; samesite=strict`;
            }
            setTimeout(() => {
                router.push("/main");
            }, 2000);
        }
        if (!isError) {
            errorRef.current = null;
        }
    }, [isError, isSuccess, error, data, toastError, toastSuccess, router]);

    const onSubmit = (data: ILoginFormType) => {
        mutate({ ...data });
    };
    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-sky-800">Masuk</h1>
                    <p className="text-sky-800">Masuk ke akun Anda untuk melanjutkan</p>
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

                            <ButtonSubmit
                                className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                                title="Masuk"
                                progressTitle="Masuk..."
                                isProgressing={isPending}
                            />

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
                                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-sky-800 transition-all duration-300"
                                    onClick={() => window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || ''}
                                >
                                    <FaGoogle size={20}/>
                                    <span className="ml-2">Google</span>
                                </button>
                                
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-sky-800 transition-all duration-200"
                                >
                                    <FaGithub size={20}/>
                                    <span className="ml-2">GitHub</span>
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-sm text-sky-800">
                        Belum punya akun?{' '}
                        <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                            Daftar gratis
                        </a>
                        </p>
                    </>
                )}
            
            </div>
        </AuthLayout>
        );
    };
export default LoginPage;