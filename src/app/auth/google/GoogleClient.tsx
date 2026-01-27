"use client";
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks';
import { SuccessSection } from '@/components';

const GoogleAuthClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const status = searchParams.get('status');

    const { toastSuccess } = useToast();

    useEffect(() => {
        if (status) {
            if (status === '202') {
                setTimeout(() => {
                    router.push("/main/home");
                }, 1000);
                toastSuccess('Akun berhasil diverifikasi');
            } else {
                router.push("/auth/login");
            }
        }
    }, [status, toastSuccess, router]);
    
    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-gray-900">Verifikasi Akun Google</h1>
                <p className="text-gray-800">Kami akan memverifikasi akun anda</p>
            </div>
            {status === '202' && (
                <SuccessSection message="Akun berhasil diverifikasi melalui Google.." />
            )}
        </div>
    );
}

export default GoogleAuthClient;