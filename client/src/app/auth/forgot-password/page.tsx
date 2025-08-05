'use client';
/* eslint-disable react/no-unescaped-entities */
import AuthLayout from "@/layouts/AuthLayout";
import { MdMailOutline } from "react-icons/md";
import { FaGoogle, FaGithub } from "react-icons/fa";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { IForgotPasswordFormEmailType } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import ButtonSubmit from "@/components/form/ButtonSubmit";
import ErrorSection from "@/components/UI/ErrorSection";
import SuccessSection from "@/components/UI/SuccessSection";
import {  getDataResponseMessage } from "@/utils/getDataResponse";
import { getErrorResponseDetails, getErrorResponseMessage } from "@/utils/gerErrorResponse";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { useEmailVerification } from "@/hooks/auth/useForgotPassword";
import { useRouter } from "next/navigation";
import { ForgotPasswordEmailVerificationSchema } from "../Schema";

const ForgotPasswordPage = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IForgotPasswordFormEmailType>({
        resolver: zodResolver(ForgotPasswordEmailVerificationSchema)
    });
    const { toastSuccess, toastError } = useToast();
    
    const { mutate, isPending, isError, isSuccess, error, data } = useEmailVerification();
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
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
        if (!isError) {
            errorRef.current = null;
        }
    }, [isError, isSuccess, error, data, toastError, toastSuccess, router]);

    const onSubmit = (data: IForgotPasswordFormEmailType) => {
        mutate({ ...data });
    };
    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-sky-800">Lupa Kata Sandi?</h1>
                    <p className="text-sky-800">Masukan email anda agar kami dapat mengirimkan link untuk mengatur ulang kata sandi</p>
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
                            
                            <p className="text-center text-sm text-sky-800">
                                Sudah punya akun?{' '}
                                <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                                    Masuk
                                </a>
                            </p>

                            <ButtonSubmit
                                className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                                title="Kirim Email"
                                progressTitle="Mengirim..."
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
export default ForgotPasswordPage;