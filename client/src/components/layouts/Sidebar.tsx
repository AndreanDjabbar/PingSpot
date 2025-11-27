"use client";

import { BiHome, BiX } from "react-icons/bi";
import { PingspotLogo, ProfileBadge } from "../UI";
import { FaMap, FaUsers } from "react-icons/fa";
import { GoAlert } from "react-icons/go";
import { LuActivity, LuMessageCircle } from "react-icons/lu";
import { CiSettings } from "react-icons/ci";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/stores/globalStore";
import { useUserProfileStore } from "@/stores";
import { useEffect, useRef } from "react";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    collapsed?: boolean;
    onBottomNavHeightChange?: (position: number) => void;
}

const navigationItems = [
    { id: 'home', label: 'Beranda', icon: BiHome },
    { id: 'reports', label: 'Laporan', icon: GoAlert, badge: '3' },
    { id: 'map', label: 'Peta Interaktif', icon: FaMap },
    { id: 'community', label: 'Komunitas', icon: FaUsers },
    { id: 'messages', label: 'Pesan', icon: LuMessageCircle, badge: '12' },
    { id: 'activity', label: 'Aktivitas', icon: LuActivity },
]

const bottomNavigationItems = [
    { id: 'settings', label: 'Pengaturan', icon: CiSettings, active: true },
    { id: 'help', label: 'Bantuan', icon: IoMdHelpCircleOutline },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, collapsed = false, onBottomNavHeightChange }) => {
    const router = useRouter();
    const currentPath = usePathname().split('/')[2] || 'home';
    const { setCurrentPage } = useGlobalStore();
    const user = useUserProfileStore(state => state.userProfile);
    const bottomNavRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateBorderPosition = () => {
            if (bottomNavRef.current && onBottomNavHeightChange) {
                const rect = bottomNavRef.current.getBoundingClientRect();
                onBottomNavHeightChange(rect.height);
            }
        };

        updateBorderPosition();
        window.addEventListener('resize', updateBorderPosition);

        return () => {
            window.removeEventListener('resize', updateBorderPosition);
        };
    }, [collapsed, onBottomNavHeightChange]);

    return (
        <>
            <div className={`
                fixed overflow-y-auto xl:static inset-y-0 left-0 z-50 
                ${collapsed ? 'w-16' : 'w-80'} bg-pingspot
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? '' : '-translate-x-full xl:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="flex flex-col h-full">
                        <div className={`${collapsed ? 'p-4' : 'p-4'} border-b border-white`}>
                            {collapsed ? (
                                <div className="flex justify-center">
                                    <PingspotLogo size='60' type="full"/>
                                </div>
                            ) : (
                                <ProfileBadge
                                    name={user?.username || 'User'}
                                    email={user?.email || 'User@email.com'}
                                    followers={123}
                                    imageUrl={user?.profilePicture}
                                    following={456}
                                    size="md"
                                    onClick={() => router.push('/main/settings/profile')}
                                />
                            )}
                        </div>

                        <div className="h-1/2">
                            <nav className="flex-1 px-4 py-6 space-y-2">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            router.push(`/main/${item.id}`)
                                            setCurrentPage(item.id);
                                            onToggle();
                                        }}
                                        className={`
                                        w-full flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                                        transition-all duration-200 group relative
                                        ${item.id === currentPath
                                            ? 'bg-white/20 text-gray-200' 
                                            : 'text-gray-200 hover:bg-gray-700/50 hover:text-white'
                                        }
                                        `}
                                    >
                                        <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                                        {!collapsed && (
                                        <>
                                            <span className="ml-3 font-medium">{item.label}</span>
                                            {item.badge && (
                                            <span className="ml-auto bg-red-500 text-gray-200 text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                            )}
                                        </>
                                        )}
                                        {collapsed && item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                        )}
                                    </button>
                                ))}
                            </nav>    
                        </div>

                        <div className="h-full" ref={bottomNavRef}>
                            <div  className="px-4 py-4 border-t border-white space-y-2">
                                {bottomNavigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCurrentPage(item.id);
                                        router.push(`/main/${item.id}`)
                                        onToggle();
                                    }}
                                    className={`
                                    w-full flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                                    text-gray-200 hover:bg-gray-700/50 hover:text-gray-300 transition-colors
                                    ${item.id === currentPath
                                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25' 
                                            : 'text-gray-200 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                                    {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
                                </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {!collapsed && (
                    <div className="fixed right-1/4 top-1/2 sm:right-1/3 md:right-1/3 ">
                        <button
                            onClick={onToggle}
                            className="xl:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600/50 
                                transition-all duration-300 ease-out transform hover:scale-105"
                        >
                            <BiX className="w-8 h-8 text-gray-300 group-hover:text-white 
                                transition-all duration-300 ease-out" />
                        </button>
                    </div>
                )}
            </div>

            {isOpen && (
                <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
                onClick={onToggle}
                />
            )}
        </>
    )
}

export default Sidebar;