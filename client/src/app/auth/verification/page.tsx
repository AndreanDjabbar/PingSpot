/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import AuthLayout from '@/layouts/AuthLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import ErrorSection from '@/components/UI/ErrorSection';
import { IVerificationType } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerificationSchema } from '../Schema';
import { useForm } from 'react-hook-form';
import SuccessSection from '@/components/UI/SuccessSection';
import { useToast } from '@/hooks/useToast';
import { useVerification } from '@/hooks/auth/userVerification';
import { getDataResponseDetails, getDataResponseMessage } from '@/utils/getDataResponse';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';

const page = () => {
    const searchParams = useSearchParams();
    const code1 = searchParams.get('code1');
    const userId = searchParams.get('userId');
    const code2 = searchParams.get('code2');
    const router = useRouter();
    
    const { 
        formState: { } 
    } = useForm<IVerificationType>({
        resolver: zodResolver(VerificationSchema)
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useVerification();
    const { toastSuccess, toastError } = useToast();

    useEffect(() => {
        if (code1 && userId && code2) {
            mutate({
                code1,
                userId,
                code2
            });
        }
    }, [code1, userId, code2, mutate]);

    useEffect(() => {
        if (isSuccess && data) {
            toastSuccess(getDataResponseMessage(data) || 'Akun berhasil diverifikasi');
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        }
    }, [isSuccess, data, toastSuccess]);

    useEffect(() => {
        if (isError && error) {
            console.error("Verification error:", error);
            toastError(getErrorResponseMessage(error) || 'Verifikasi gagal. Silakan coba lagi.');
        }
    }, [isError, error, toastError]);

    if (!code1 || !userId || !code2) {
        return (
            <AuthLayout>
                <div className="space-y-8">
                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-bold text-sky-800">Verifikasi</h1>
                        <p className="text-sky-800">Kami akan memverifikasi akun anda</p>
                    </div>
                    <ErrorSection 
                        message="Link verifikasi tidak valid. Silakan periksa kembali link verifikasi yang Anda terima."
                    />
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Verifikasi</h1>
                    <p className="text-sky-800">Kami akan memverifikasi akun anda</p>
                </div>
                
                {isPending && (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-800"></div>
                        <p className="mt-2 text-sky-800">Memverifikasi akun...</p>
                    </div>
                )}
                
                {isSuccess && (
                    <SuccessSection 
                    message='Akun anda berhasil diverifikasi'
                    data={() => {
                        const {username} = getDataResponseDetails(data);
                        return `Selamat datang, ${username}! sekarang anda dapat masuk ke akun Anda.`;
                    }}/>
                )}
                
                {isError && (
                    <ErrorSection 
                        message={getErrorResponseMessage(error) || 'Verifikasi gagal. Silakan coba lagi.'}
                        errors={getErrorResponseDetails(error)}
                    />
                )}
            </div>
        </AuthLayout>
    )
}

export default page