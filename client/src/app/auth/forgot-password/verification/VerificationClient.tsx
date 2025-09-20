"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { SuccessSection, ErrorSection } from '@/components/feedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLinkVerification, useResetPassword } from '@/hooks/auth/useForgotPassword';
import ButtonSubmit from '@/components/form/ButtonSubmit';
import InputField from '@/components/form/InputField';
import { LuLockKeyhole } from 'react-icons/lu';
import { IForgotPasswordResetPasswordType } from '../../Schema';
import { ForgotPasswordResetPasswordSchema } from '../../Schema';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import useErrorToast from '@/hooks/useErrorToast';
import useSuccessToast from '@/hooks/useSuccessToast';

const VerificationClient = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    const router = useRouter();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<IForgotPasswordResetPasswordType>({
        resolver: zodResolver(ForgotPasswordResetPasswordSchema)
    });
    
    const { mutate: resetPassword, isPending, isError, isSuccess, error, data } = useResetPassword();
    const { 
        mutate: verifyLink, 
        isPending: isPendingVerify, 
        isError: isErrorVerify, 
        isSuccess: isSuccessVerify, 
        error: errorVerify, 
    } = useLinkVerification();

    useErrorToast(isError, error);
    useErrorToast(isErrorVerify, errorVerify);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (email && code) {
            verifyLink({
                code,
                email
            });
        }
    }, [code, email, verifyLink]);

    useEffect(() => {
        if (isSuccess && data) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
    }, [isSuccess, data, router]);

    useEffect(() => {
        if (isErrorVerify && errorVerify) {
            console.error("Link verification error:", errorVerify);
            setTimeout(() => {
                router.push("/auth/forgot-password");
            }, 2000);
        }
    }, [isErrorVerify, errorVerify, router]);

    if (!code || !email) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Reset Password</h1>
                    <p className="text-sky-800">Atur ulang kata sandi Anda</p>
                </div>
                <ErrorSection 
                    message="Link reset password tidak valid. Silakan periksa kembali link yang Anda terima melalui email."
                />
            </div>
        );
    }

    if (isPendingVerify) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Atur ulang Kata Sandi</h1>
                    <p className="text-sky-800">Memverifikasi link atur ulang kata sandi...</p>
                </div>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-800"></div>
                    <p className="mt-2 text-sky-800">Memverifikasi link...</p>
                </div>
            </div>
        );
    }

    if (isErrorVerify) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Atur ulang Kata Sandi</h1>
                    <p className="text-sky-800">Verifikasi link gagal</p>
                </div>
                <ErrorSection 
                    message={getErrorResponseMessage(errorVerify) || 'Link reset password tidak valid atau sudah kadaluarsa.'}
                    errors={getErrorResponseDetails(errorVerify)}
                />
            </div>
        );
    }

    const onSubmit = (formData: IForgotPasswordResetPasswordType) => {
        resetPassword({ 
            ...formData,
            email: email
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-sky-800">Atur ulang Kata Sandi</h1>
                <p className="text-sky-800">Atur ulang kata sandi Anda</p>
            </div>
            
            {isSuccess && (
                <SuccessSection 
                    message='Password berhasil diatur ulang'
                    data={() => {
                        return "Password Anda telah berhasil diatur ulang. Anda akan dialihkan ke halaman login.";
                    }}
                />
            )}
            
            {isError && (
                <ErrorSection 
                    message={getErrorResponseMessage(error) || 'Reset password gagal. Silakan coba lagi.'}
                    errors={getErrorResponseDetails(error)}
                />
            )}

            {!isSuccess && isSuccessVerify && (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <InputField
                            id="password"
                            name="password"
                            type={'password'}
                            register={register("password")}
                            className="w-full"
                            withLabel={true}
                            labelTitle="Kata Sandi Baru"
                            icon={<LuLockKeyhole size={20} />}
                            placeHolder="Masukkan kata sandi baru"
                            showPasswordToggle={true}
                        />
                        {errors.password?.message && (
                            <div className="text-red-500 text-sm font-semibold mt-1">
                                {errors.password.message}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <InputField
                            id="passwordConfirmation"
                            register={register("passwordConfirmation")}
                            type="password"
                            className="w-full"
                            withLabel={true}
                            labelTitle="Konfirmasi Kata Sandi Baru"
                            icon={<LuLockKeyhole size={20}/>} 
                            placeHolder="Masukkan ulang kata sandi baru"
                            showPasswordToggle={true}
                        />
                        {errors.passwordConfirmation?.message && (
                            <div className="text-red-500 text-sm font-semibold mt-1">
                                {errors.passwordConfirmation.message}
                            </div>
                        )}
                    </div>

                    <ButtonSubmit
                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                        title="Atur Ulang Kata Sandi"
                        progressTitle="Memproses..."
                        isProgressing={isPending}
                    />
                </form>
            )}

            <div className="text-center">
                <p className="text-sm text-sky-800">
                    Kembali ke{' '}
                    <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                        Halaman Login
                    </a>
                </p>
            </div>
        </div>
    )
}

export default VerificationClient;