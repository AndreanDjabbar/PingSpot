/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { useUserProfileStore } from '@/stores/userProfileStore';
import InputField from '@/components/form/InputField';
import { IoPersonSharp } from 'react-icons/io5';
import TextAreaField from '@/components/form/TextaAreaField';
import { LuNotebookText } from 'react-icons/lu';
import Breadcrumb from '@/components/UI/Breadcrumb';

const ProfilePage = () => {
    const currentPath = usePathname();
    const user = useUserProfileStore(state => state.userProfile);

    return (
        <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <div className="flex flex-col gap-6">
                    <Breadcrumb path={currentPath}/>
                    <p className="text-gray-600 text-lg">
                    Sesuaikan PingSpot dengan preferensi Anda untuk pengalaman yang lebih baik.
                    </p>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <div className="">
                    <form className="flex justify-center p-5 space-y-4  w-full gap-10">
                            <div className='w-1/2 flex flex-col gap-6 justify-between'>
                                <div className="w-full">
                                    <InputField
                                        id="fullName"
                                        // register={register("fullName")}
                                        type="text"
                                        className="w-full"
                                        withLabel={true}
                                        value={user?.fullName || ''}
                                        labelTitle="Nama Lengkap"
                                        icon={<IoPersonSharp size={20}/>} 
                                        placeHolder="Masukkan nama lengkap Anda"
                                    />
                                    {/* <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div> */}
                                </div>

                                <div className="w-full">
                                    <InputField
                                        id="username"
                                        // register={register("fullName")}
                                        type="text"
                                        className="w-full"
                                        withLabel={true}
                                        value={user?.username || ''}
                                        labelTitle="Username"
                                        icon={<IoPersonSharp size={20}/>} 
                                        placeHolder="Masukkan username Anda"
                                    />
                                    {/* <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div> */}
                                </div>

                                <div className="w-full">
                                    <TextAreaField
                                        id="bio"
                                        className="w-full"
                                        withLabel={true}
                                        labelTitle="Bio Anda"
                                        icon={<LuNotebookText size={20}/>} 
                                        placeHolder="Masukkan bio Anda"
                                    />
                                    {/* <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div> */}
                                </div>
                            </div>
                            <div className='w-1/2 flex flex-col gap-6'>
                                <div className="w-full">
                                    <InputField
                                        id="fullName"
                                        // register={register("fullName")}
                                        type="text"
                                        className="w-full"
                                        withLabel={true}
                                        labelTitle="Nama Lengkap"
                                        icon={<IoPersonSharp size={20}/>} 
                                        placeHolder="Masukkan nama lengkap Anda"
                                    />
                                    {/* <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div> */}
                                </div>

                                <div className="w-full">
                                    <InputField
                                        id="fullName"
                                        // register={register("fullName")}
                                        type="text"
                                        className="w-full"
                                        withLabel={true}
                                        labelTitle="Nama Lengkap"
                                        icon={<IoPersonSharp size={20}/>} 
                                        placeHolder="Masukkan nama lengkap Anda"
                                    />
                                    {/* <div className="text-red-500 text-sm font-semibold">{errors.fullName?.message as string}</div> */}
                                </div>
                            </div>
                        </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage