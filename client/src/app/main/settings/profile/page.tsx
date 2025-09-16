/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { InputField, DateTimeField, RadioField, ImageField, ButtonSubmit } from '@/components/form';
import TextAreaField from '@/components/form/TextaAreaField';
import { IoPersonSharp } from 'react-icons/io5';
import { LuNotebookText } from 'react-icons/lu';
import { FaCalendarAlt } from 'react-icons/fa';
import { TbGenderBigender } from "react-icons/tb";
import { SaveProfileSchema } from '../../schema';
import { ISaveProfileFormType } from '@/types/userTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSaveProfile } from '@/hooks/user/useSaveProfile';
import useErrorToast from '@/hooks/useErrorToast';
import useSuccessToast from '@/hooks/useSuccessToast';
import SuccessSection from '@/components/UI/SuccessSection';
import { getDataResponseMessage } from '@/utils/getDataResponse';
import ErrorSection from '@/components/UI/ErrorSection';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import HeaderSection from '../../components/HeaderSection';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog';

const ProfilePage = () => {
    const user = useUserProfileStore(state => state.userProfile);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [birthdayDate, setBirthdayDate] = useState<string>(user?.birthday || '');
    const [removedProfilePicture, setRemovedProfilePicture] = useState(false);
    const [isSaveProfileModalOpen, setIsSaveProfileModalOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    
    const defaultValues = {
        fullName: user?.fullName || '',
        username: user?.username || '',
        gender: user?.gender as "male" | "female" | null | undefined,
        bio: user?.bio || '',
        birthday: user?.birthday || null,
        profilePicture: user?.profilePicture ? undefined : undefined
    };

    const { 
        register, 
        handleSubmit, 
        setValue,
        watch,
        formState: { errors } 
    } = useForm<ISaveProfileFormType>({
        resolver: zodResolver(SaveProfileSchema),
        defaultValues: defaultValues
    });
    
    const { mutate, isPending, isError, isSuccess, error, data } = useSaveProfile();
    const currentPath = usePathname();
    
    const onSubmit = (formData: ISaveProfileFormType) => {
        const preparedData = prepareFormData(formData);
        setFormDataToSubmit(preparedData);
        setIsSaveProfileModalOpen(true);
    };

    const prepareFormData = (formData: ISaveProfileFormType): FormData => {
        const data = new FormData();

        data.append('fullName', formData.fullName);
        data.append('username', formData.username);
        
        if (formData.bio) {
            data.append('bio', formData.bio);
        }
        
        if (formData.birthday) {
            if (birthdayDate.trim() === "") {
                data.append("birthday", user?.birthday ? user.birthday : "");
            } else {
                const date = new Date(birthdayDate);
                const formatted = date.toISOString().split("T")[0];
                data.append("birthday", formatted);
            }
        }
        
        if (formData.gender) {
            data.append('gender', formData.gender);
        }
        
        if (profilePicture) {
            data.append('profilePicture', profilePicture);
        } else {
            if (removedProfilePicture) {
                data.append('removeProfilePicture', 'true');
            } else if (user?.profilePicture) {
                data.append('defaultProfilePicture', user?.profilePicture ? user.profilePicture : '');
            }
        }
        return data;
    }

    const confirmSubmit = () => {
        if (formDataToSubmit) {
            mutate(formDataToSubmit);
        }
    }

    const genderOptions = [
        { value: 'male', label: 'Laki-laki' },
        { value: 'female', label: 'Perempuan' },
    ];
    
    const genderValue = watch('gender');

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName || '');
            setValue('username', user.username || '');
            setValue('gender', user.gender as "male" | "female" | null | undefined);
            setValue('bio', user.bio || '');
            setValue('birthday', user.birthday || undefined);
        }
    }, [user, setValue]);

    useEffect(() => {
        if (isSuccess && data) {
            setIsSaveProfileModalOpen(false);
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
            message='Sesuaikan PingSpot dengan preferensi Anda untuk pengalaman yang lebih baik.'/>

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
                                <div className="w-full flex flex-col justify-center items-center">
                                    <ImageField
                                        id="profilePicture"
                                        withLabel={true}
                                        labelTitle="Foto Profil"
                                        buttonTitle="Pilih Foto"
                                        currentImage={ user?.profilePicture 
                                            ?`${process.env.NEXT_PUBLIC_user_static_URL}/${user?.profilePicture}` 
                                            : `${process.env.NEXT_PUBLIC_user_static_URL}/default.png`
                                        }
                                        onChange={(file) => {
                                            setProfilePicture(file);                             
                                        }}
                                        onRemove={() => {
                                            setProfilePicture(null);
                                            setRemovedProfilePicture(true);
                                        }}
                                        shape="circle"
                                        height={160}
                                        width={160}
                                    />
                                    {profilePicture && (
                                        <div className="mt-2 text-sm text-green-600">
                                            File dipilih: {profilePicture.name}
                                        </div>
                                    )}
                                    <div className="text-red-500 text-sm font-semibold">{errors.profilePicture?.message as string}</div>
                                </div>

                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className="w-full">
                                        <InputField
                                            id="fullName"
                                            register={register("fullName")}
                                            type="text"
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle="Nama Lengkap"
                                            icon={<IoPersonSharp size={20}/>} 
                                            placeHolder="Masukkan nama lengkap Anda"
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div>
                                    </div>
                                    <div className="w-full">
                                        <InputField
                                            id="username"
                                            register={register("username")}
                                            type="text"
                                            className="w-full"
                                            withLabel={true}
                                            labelTitle="Username"
                                            icon={<IoPersonSharp size={20}/>} 
                                            placeHolder="Masukkan username Anda"
                                            disabled
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.username?.message as string}</div>
                                    </div>
                                </div>
                                
                                <div className='flex flex-col gap-6 md:flex-row'>
                                    <div className='w-full'>
                                        <DateTimeField
                                            id="birthday"
                                            name="birthday"
                                            type="date"
                                            onChange={(e) => {
                                                setBirthdayDate(e.target.value);
                                                setValue("birthday", e.target.value);
                                            }}
                                            value={user?.birthday || ''}
                                            labelTitle="Tanggal Lahir"
                                            icon={<FaCalendarAlt />}
                                            withLabel={true}
                                            max={"2023-12-31"}
                                            min={"1905-01-01"}
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors.birthday?.message as string}</div>
                                    </div>

                                    <div className='w-full'>
                                        <RadioField
                                            id="gender"
                                            name="gender"
                                            withLabel={true}
                                            register={register("gender")}
                                            labelTitle="Jenis Kelamin"
                                            options={genderOptions}
                                            value={genderValue || ''}
                                            onChange={(val) => {
                                                console.log("Setting gender to:", val);
                                                setValue("gender", val as "male" | "female");
                                            }}
                                            layout='horizontal'
                                            icon={<TbGenderBigender size={20}/>}
                                        />
                                        <div className="text-red-500 text-sm font-semibold">{errors?.gender?.message as string}</div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <TextAreaField
                                        id="bio"
                                        className="w-full"
                                        withLabel={true}
                                        register={register("bio")}
                                        labelTitle="Bio Anda"
                                        icon={<LuNotebookText size={20}/>} 
                                        placeHolder="Masukkan bio Anda"
                                    />
                                    <div className="text-red-500 text-sm font-semibold">{errors.bio?.message as string}</div>
                                </div>
                                
                                <div className="w-full flex justify-end mt-6">
                                    <ButtonSubmit
                                        className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                                        title="Perbarui Profil"
                                        progressTitle="Memperbarui..."
                                        isProgressing={isPending}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmationDialog
            isOpen={isSaveProfileModalOpen}
            onClose={() => setIsSaveProfileModalOpen(false)}
            onConfirm={confirmSubmit}
            isPending={isPending}
            type='info'
            cancelTitle='Batal'
            confirmTitle='Ubah'
            title='Konfirmasi Perubahan Profil'
            explanation='Informasi profil anda akan diubah.'
            message='Apakah Anda yakin ingin ubah?'
            icon={<IoPersonSharp/>}
            />
        </div>
    );
};

export default ProfilePage