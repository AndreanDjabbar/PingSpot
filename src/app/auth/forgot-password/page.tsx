'use client';
import { MdMailOutline } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { InputField, ButtonSubmit } from "@/components/form";
import { useForm } from "react-hook-form";
import { IForgotPasswordEmailVerificationRequest } from "@/types/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorSection, SuccessSection } from "@/components/feedback";
import { getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage } from "@/utils";
import { useEffect } from "react";
import { useEmailVerification } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { ForgotPasswordEmailVerificationSchema } from "../Schema";
import { useErrorToast, useSuccessToast } from "@/hooks/toast";

const ForgotPasswordPage = () => {
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IForgotPasswordEmailVerificationRequest>({
        resolver: zodResolver(ForgotPasswordEmailVerificationSchema)
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useEmailVerification();
    const router = useRouter();
    
    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    const onSubmit = (data: IForgotPasswordEmailVerificationRequest) => {
        mutate({ ...data });
    };
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Lupa Kata Sandi?</h1>
                <p className="text-gray-800">Masukan email anda agar kami dapat mengirimkan link untuk mengatur ulang kata sandi</p>
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
                        
                        <p className="text-center text-sm text-gray-700">
                            Sudah punya akun?{' '}
                            <a href="/auth/login" className="font-medium text-sky-700 hover:text-sky-800 transition-colors duration-200">
                                Masuk
                            </a>
                        </p>

                        <ButtonSubmit
                            className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                            title="Kirim Email"
                            progressTitle="Mengirim..."
                            isProgressing={isPending}
                        />

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
export default ForgotPasswordPage;