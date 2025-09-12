/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { InputField, ButtonSubmit } from '@/components/form';
import { SaveSecuritySchema } from '../../schema';
import { ISaveSecurityFormType } from '@/types/userTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useErrorToast from '@/hooks/useErrorToast';
import useSuccessToast from '@/hooks/useSuccessToast';
import SuccessSection from '@/components/UI/SuccessSection';
import { getDataResponseMessage } from '@/utils/getDataResponse';
import ErrorSection from '@/components/UI/ErrorSection';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import HeaderSection from '../../components/HeaderSection';
import { LuLockKeyhole } from 'react-icons/lu';
import { useSaveSecurity } from '@/hooks/user/useSaveSecurity';

const SecurityPage = () => {
    const user = useUserProfileStore(state => state.userProfile);

    const { 
        register, 
        handleSubmit, 
        setValue,
        formState: { errors } 
    } = useForm<ISaveSecurityFormType>({
        resolver: zodResolver(SaveSecuritySchema),
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useSaveSecurity();
    const currentPath = usePathname();
    
    const onSubmit = (data: ISaveSecurityFormType) => {
        mutate(data);
    };

    useEffect(() => {
        if (user) {

        }
    }, [user, setValue]);

    useEffect(() => {
        if (isSuccess && data) {
            console.log("Profile updated successfully");
            setTimeout(() => {
                window.location.reload();
            }, 500)
        }
    }, [isSuccess, data]);

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
                                            id="oldPassword"
                                            register={register("oldPassword")}
                                            type="password"
                                            className="w-full"
                                            withLabel={true}
                                            showPasswordToggle={true}
                                            labelTitle="Kata Sandi Lama"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Kata Sandi Lama Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.oldPassword?.message as string}</div>
                                    </div>
                                    <div className="w-full">
                                        <InputField
                                            id="oldPasswordConfirmation"
                                            register={register("oldPasswordConfirmation")}
                                            type="password"
                                            showPasswordToggle={true}
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle="Konfirmasi Kata Sandi Lama"
                                            icon={<LuLockKeyhole size={20}/>} 
                                            placeHolder="Masukkan Ulang Kata Sandi Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.oldPasswordConfirmation?.message as string}</div>
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