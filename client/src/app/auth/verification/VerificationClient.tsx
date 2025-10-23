"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { VerificationSchema } from '../Schema';
import { useForm } from 'react-hook-form';
import { useVerification } from '@/hooks/auth';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { getDataResponseDetails, getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { IVerificationRequest } from '@/types/api/auth';

const VerificationClient = () => {
    const searchParams = useSearchParams();
    const code1 = searchParams.get('code1');
    const userId = searchParams.get('userId');
    const code2 = searchParams.get('code2');
    const router = useRouter();
    
    const { 
        formState: { } 
    } = useForm<IVerificationRequest>({
        resolver: zodResolver(VerificationSchema)
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useVerification();

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

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
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, data, router]);

    if (!code1 || !userId || !code2) {
        return (
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900">Verifikasi</h1>
                    <p className="text-gray-800">Kami akan memverifikasi akun anda</p>
                </div>
                <ErrorSection 
                    message="Link verifikasi tidak valid. Silakan periksa kembali link verifikasi yang Anda terima."
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Verifikasi</h1>
                <p className="text-gray-800">Kami akan memverifikasi akun anda</p>
            </div>
            
            {isPending && (
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-800">Memverifikasi akun...</p>
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
    )
}

export default VerificationClient;