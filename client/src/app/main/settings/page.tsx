/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from 'react';
import { BiLock, BiEnvelope, BiUser, BiCog } from 'react-icons/bi';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import { MdOutlineLanguage } from 'react-icons/md';
import ProfileForm from './components/ProfileForm';
import PasswordForm from './components/PasswordForm';
import useSuccessToast from '@/hooks/useSuccessToast';
import getAuthToken from '@/utils/getAuthToken';
import { useLogout } from '@/hooks/auth/useLogout';
import useErrorToast from '@/hooks/useErrorToast';
import { useRouter } from 'next/navigation';
import { ImExit } from 'react-icons/im';

interface SettingsCardProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, icon: Icon, children }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon className="w-6 h-6 text-sky-600 mr-2" />
            {title}
        </h2>
        {children}
        </div>
    );
};

interface SettingItemProps {
    title: string;
    description: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ title, description, icon: Icon, action }) => {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
        <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-5 h-5 text-gray-500" />}
            <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        {action}
        </div>
    );
};

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => {
    return (
        <button
        type="button"
        onClick={onChange}
        className={`${
            enabled ? 'bg-sky-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
        <span className="sr-only">{enabled ? 'Enable' : 'Disable'}</span>
        <span
            className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
        </button>
    );
};

const SettingsPage = () => {
    const router = useRouter();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    
    const [selectedLanguage, setSelectedLanguage] = useState('id');
    const languages = [
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'en', name: 'English' },
    ];
    const { mutate: logout, isPending, isError, error, isSuccess, data } = useLogout();
    
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
        const token = getAuthToken();
        if (token) {
            logout({ authToken: token });
        } else {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
            router.push("/auth/login");
        }
    };

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        useSuccessToast(true, `Bahasa berhasil diubah ke ${languages.find(l => l.code === langCode)?.name}`)
    };

    return (
        <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Pengaturan
                    </h1>
                    <p className="text-gray-600 text-lg">
                    Sesuaikan PingSpot dengan preferensi Anda untuk pengalaman yang lebih baik.
                    </p>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SettingsCard title="Akun & Profil" icon={BiUser}>
                <div className="space-y-2">
                    <SettingItem
                    title="Profil Pengguna"
                    description="Ubah informasi profil, foto, dan preferensi Anda"
                    icon={BiUser}
                    action={
                        <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Edit
                        </button>
                    }
                    />
                    <SettingItem
                    title="Keamanan Akun"
                    description="Ubah password dan pengaturan keamanan"
                    icon={BiLock}
                    action={
                        <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Update
                        </button>
                    }
                    />
                    <SettingItem
                    title="Email"
                    description="andreaandjabbar@gmail.com"
                    icon={BiEnvelope}
                    action={
                        <button 
                        onClick={() => useSuccessToast(true, 'Email verifikasi telah dikirim.')}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Verifikasi
                        </button>
                    }
                    />
                    <SettingItem
                    title="Nomor Telepon"
                    description="+62 812 3456 7890"
                    icon={IoPhonePortraitOutline}
                    action={
                        <button 
                        onClick={() => useSuccessToast(true, 'Kode verifikasi telah dikirim ke nomor Anda.')}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                        Verifikasi
                        </button>
                    }
                    />
                </div>
                </SettingsCard>

                <SettingsCard title="Preferensi Umum" icon={BiCog}>
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
                                <MdOutlineLanguage className="mr-2 text-gray-500" />
                                <span>{lang.name}</span>
                            </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Notifikasi</h3>
                        <div className="flex flex-col space-y-2">
                            <SettingItem
                            title="Notifikasi"
                            description="Aktifkan atau nonaktifkan semua notifikasi"
                            action={
                                <ToggleSwitch
                                enabled={notificationsEnabled}
                                onChange={() => {
                                    setNotificationsEnabled(!notificationsEnabled);
                                    useSuccessToast(true, notificationsEnabled 
                                    ? 'Notifikasi dinonaktifkan' 
                                    : 'Notifikasi diaktifkan'
                                    );
                                }}
                                />
                            }
                            />
                            <SettingItem
                            title="Notifikasi Email"
                            description="Terima notifikasi melalui email"
                            action={
                                <ToggleSwitch
                                enabled={emailNotificationsEnabled}
                                onChange={() => {
                                    setEmailNotificationsEnabled(!emailNotificationsEnabled);
                                    useSuccessToast(true, emailNotificationsEnabled 
                                    ? 'Notifikasi email dinonaktifkan' 
                                    : 'Notifikasi email diaktifkan'
                                    );
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
                </SettingsCard>
            </div>

            <ProfileForm 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
            
            <PasswordForm 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

export default SettingsPage