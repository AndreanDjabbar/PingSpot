/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from 'react';
import { BiLock, BiEnvelope, BiUser, BiCog } from 'react-icons/bi';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import { MdOutlineLanguage, MdOutlineMarkEmailUnread } from 'react-icons/md';
import PasswordForm from './components/PasswordForm';
import useSuccessToast from '@/hooks/useSuccessToast';
import getAuthToken from '@/utils/getAuthToken';
import { useLogout } from '@/hooks/auth/useLogout';
import useErrorToast from '@/hooks/useErrorToast';
import { usePathname, useRouter } from 'next/navigation';
import { ImExit } from 'react-icons/im';
import { IoIosNotifications } from "react-icons/io";
import { useUserProfileStore } from '@/stores/userProfileStore';
import SettingItem from './components/SettingItem';
import ToggleSwitch from '@/components/UI/ToggleSwitch';
import SettingCard from './components/SettingCard';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog';
import HeaderSection from '../components/HeaderSection';

const SettingsPage = () => {
    const router = useRouter();
    const currentPath = usePathname();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    
    const [selectedLanguage, setSelectedLanguage] = useState('id');
    const languages = [
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'en', name: 'English' },
    ];
    const { mutate: logout, isPending, isError, error, isSuccess, data } = useLogout();
    const user = useUserProfileStore(state => state.userProfile);
    
    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    useEffect(() => {
        if (isSuccess) {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
            
            setTimeout(() => {
                router.push("/auth/login");
            }, 1000);
        }
    }, [isSuccess, router]);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };
    
    const confirmLogout = () => {
        const token = getAuthToken();
        if (token) {
            logout();
        } else {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
            router.push("/auth/login");
        }
    };

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
    };
    
    return (
        <div className="space-y-8">
            <HeaderSection 
            currentPath={currentPath}
            message='Sesuaikan PingSpot dengan preferensi Anda untuk pengalaman yang lebih baik.'/>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SettingCard title="Akun & Profil" icon={BiUser}>
                <div className="space-y-2">
                    <SettingItem
                    title="Profil Pengguna"
                    description="Ubah informasi profil, foto, dan preferensi Anda"
                    icon={BiUser}
                    action={
                        <button 
                        onClick={() => router.push('/main/settings/profile')}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Ubah
                        </button>
                    }
                    />
                    <SettingItem
                    title="Keamanan Akun"
                    description="Ubah password dan pengaturan keamanan"
                    icon={BiLock}
                    action={
                        <button 
                        onClick={() => router.push('/main/settings/security')}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Ubah
                        </button>
                    }
                    />
                    <SettingItem
                    title="Email"
                    description={user?.email || ''}
                    icon={BiEnvelope}
                    />
                    <SettingItem
                    title="Nomor Telepon"
                    description=""
                    icon={IoPhonePortraitOutline}
                    />
                </div>
                </SettingCard>

                <SettingCard title="Preferensi Umum" icon={BiCog}>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Bahasa</h3>
                        <div className="flex flex-col space-y-2">
                            {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center p-3 rounded-lg border transition-all ${
                                selectedLanguage === lang.code
                                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <MdOutlineLanguage className="mr-2 text-sky-800" />
                                <span>{lang.name}</span>
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Notifikasi</h3>
                        <div className="flex flex-col space-y-2">
                            <SettingItem
                            icon={IoIosNotifications}
                            title="Notifikasi"
                            description="Aktifkan atau nonaktifkan semua notifikasi"
                            action={
                                <ToggleSwitch
                                enabled={notificationsEnabled}
                                onChange={() => {
                                    setNotificationsEnabled(!notificationsEnabled);
                                }}
                                />
                            }
                            />
                            <SettingItem
                            title="Notifikasi Email"
                            icon={MdOutlineMarkEmailUnread}
                            description="Terima notifikasi melalui email"
                            action={
                                <ToggleSwitch
                                enabled={emailNotificationsEnabled}
                                onChange={() => {
                                    setEmailNotificationsEnabled(!emailNotificationsEnabled);
                                }}
                                />
                            }
                            />
                        </div>
                    </div>

                    <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className={`
                    w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                    text-white font-medium
                    ${isPending 
                        ? 'bg-red-900 cursor-not-allowed' 
                        : 'bg-red-700 hover:bg-red-800 active:bg-red-700'
                    } transition-all shadow-md hover:shadow-lg
                    `}
                >
                    <ImExit className={`w-5 h-5 ${isPending ? 'animate-pulse' : ''}`} />
                    <span>{isPending ? 'Keluar...' : 'Keluar'}</span>
                </button>

                </div>
                </SettingCard>
            </div>
            
            <PasswordForm 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
            
            <ConfirmationDialog
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                isPending={isPending}
                type='warning'
                cancelTitle='Batal'
                confirmTitle='Keluar'
                title='Konfirmasi Keluar'
                explanation='Anda akan keluar dari sesi PingSpot saat ini.'
                message='Apakah Anda yakin ingin keluar?'
                icon={<ImExit/>}
            />
        </div>
    );
};

export default SettingsPage