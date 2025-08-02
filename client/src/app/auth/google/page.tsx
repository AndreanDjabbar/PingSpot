"use client";
import React, { useEffect } from 'react'
import AuthLayout from '@/layouts/AuthLayout'
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import SuccessSection from '@/components/UI/SuccessSection';

const GoogleAuthpage = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { toastSuccess } = useToast();

    useEffect(() => {
        if (token) {
            toastSuccess('Akun berhasil diverifikasi');
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }
    }, [token, toastSuccess]);
    
    return (
        <AuthLayout>
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-sky-800">Verifikasi Akun Google</h1>
                    <p className="text-sky-800">Kami akan memverifikasi akun anda</p>
                </div>
                {token && (
                    <SuccessSection message="Akun berhasil diverifikasi melalui Google.." />
                )}
            </div>
        </AuthLayout>
    );
}

export default GoogleAuthpage