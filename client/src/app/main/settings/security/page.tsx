/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { InputField, ButtonSubmit } from '@/components/form';
import { SaveSecuritySchema } from '../../schema';
import { ISaveSecurityRequest } from '@/types/api/user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useErrorToast from '@/hooks/useErrorToast';
import useSuccessToast from '@/hooks/useSuccessToast';
import { SuccessSection, ErrorSection } from '@/components/feedback';
import { getDataResponseMessage } from '@/utils/getDataResponse';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import HeaderSection from '../../components/HeaderSection';
import { LuLockKeyhole } from 'react-icons/lu';
import { useSaveSecurity } from '@/hooks/user/useSaveSecurity';
import { IoKey } from 'react-icons/io5';
import { useLogout } from '@/hooks/auth/useLogout';
import { useConfirmationModalStore } from '@/stores/confirmationModalStore';

const SecurityPage = () => {
    const [securityData, setSecurityData] = useState<ISaveSecurityRequest | null>(null);
    const {openConfirm} = useConfirmationModalStore();

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<ISaveSecurityRequest>({
        resolver: zodResolver(SaveSecuritySchema),
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useSaveSecurity();
    const { mutate: logout, isSuccess: isLogoutSuccess } = useLogout();
    const currentPath = usePathname();
    const router = useRouter();
    
    const confirmationModal = () => {
        openConfirm({
            type: "info",
            title: "Konfirmasi Perubahan keamanan",
            message: "Apakah Anda yakin ingin ubah?",
            isPending: isPending,
            explanation: "Informasi keamanan (kata sandi) anda akan diubah.",
            confirmTitle: "Ubah",
            cancelTitle: "Batal",
            icon: <IoKey />,
            onConfirm: () => confirmSubmit(),
        });
    }

    const onSubmit = (data: ISaveSecurityRequest) => {
        setSecurityData(data);
        confirmationModal();
    };
    
    const confirmSubmit = () => {
        if (securityData) {
            mutate(securityData);
        }
    }

    useEffect(() => {
        if (isSuccess && data) {
            logout();
        }
    }, [isSuccess, data]);

    useEffect(() => {
        if (isLogoutSuccess) {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000)
        }
    }, [isLogoutSuccess, router]);

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    return (
        <div className="space-y-8">
            <HeaderSection 
            currentPath={currentPath}
            message='Perbarui kata sandi dan tingkatkan keamanan akun Anda.'/>

            {isSuccess && (
                <SuccessSection message={getDataResponseMessage(data)}/>
            )}

            {isError && (
                <ErrorSection 
                message={getErrorResponseMessage(error)} 
                errors={getErrorResponseDetails(error)}/>
            )}

            {!isSuccess && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                    <div className="">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-4  w-full gap-10" encType="multipart/form-data">
                            <div className='w-full flex flex-col gap-6 justify-between'>
                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className="w-full">
                                        <InputField
                                            id="currentPassword"
                                            register={register("currentPassword")}
                                            type="password"
                                            className="w-full"
                                            withLabel={true}
                                            showPasswordToggle={true}
                                            labelTitle="Kata Sandi Lama"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Kata Sandi Lama Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.currentPassword?.message as string}</div>
                                    </div>
                                    <div className="w-full">
                                        <InputField
                                            id="currentPasswordConfirmation"
                                            register={register("currentPasswordConfirmation")}
                                            type="password"
                                            showPasswordToggle={true}
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle="Konfirmasi Kata Sandi Lama"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Ulang Kata Sandi Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.currentPasswordConfirmation?.message as string}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className="w-full">
                                        <InputField
                                            id="newPassword"
                                            register={register("newPassword")}
                                            type="password"
                                            className="w-full"
                                            showPasswordToggle={true}
                                            withLabel={true}
                                            labelTitle="Kata Sandi Baru"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Kata Sandi Baru Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.newPassword?.message as string}</div>
                                    </div>
                                    <div className="w-full">
                                        <InputField
                                            id="newPasswordConfirmation"
                                            register={register("newPasswordConfirmation")}
                                            type="password"
                                            className="w-full"
                                            withLabel={true}
                                            showPasswordToggle={true}
                                            labelTitle="Konfirmasi Kata Sandi Baru"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Ulang Kata Sandi Baru Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.newPasswordConfirmation?.message as string}</div>
                                    </div>
                                </div>
                                <div className="w-full flex justify-end mt-6">
                                    <ButtonSubmit
                                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                                        title="Perbarui Sandi"
                                        progressTitle="Memperbarui..."
                                        isProgressing={isPending}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;