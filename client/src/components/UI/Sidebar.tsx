import { BiHome, BiX } from "react-icons/bi";
import PingspotLogo from "./PingspotLogo";
import { FaMap, FaUsers } from "react-icons/fa";
import { GoAlert } from "react-icons/go";
import { LuActivity, LuMessageCircle } from "react-icons/lu";
import { CiSettings } from "react-icons/ci";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { ImExit } from "react-icons/im";
import { useLogout } from "@/hooks/auth/useLogout";
import { usePathname, useRouter } from "next/navigation";
import useSuccessToast from "@/hooks/useSuccessToast";
import useErrorToast from "@/hooks/useErrorToast";
import getAuthToken from "@/utils/getAuthToken";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/globalStore";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    collapsed?: boolean;
}

const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: BiHome },
    { id: 'map', label: 'Peta Interaktif', icon: FaMap },
    { id: 'reports', label: 'Laporan Saya', icon: GoAlert, badge: '3' },
    { id: 'community', label: 'Komunitas', icon: FaUsers },
    { id: 'messages', label: 'Pesan', icon: LuMessageCircle, badge: '12' },
    { id: 'activity', label: 'Aktivitas', icon: LuActivity },
]

const bottomNavigationItems = [
    { id: 'settings', label: 'Pengaturan', icon: CiSettings, active: true },
    { id: 'help', label: 'Bantuan', icon: IoMdHelpCircleOutline },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, collapsed = false }) => {
    const { mutate: logout, isPending, isError, error, isSuccess, data } = useLogout();
    const router = useRouter();
    const currentPath = usePathname().split('/')[2] || 'home';
    const { setCurrentPage } = useGlobalStore();

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

    return (
        <>
            <div className={`
                fixed overflow-y-auto lg:static inset-y-0 left-0 z-50 
                ${collapsed ? 'w-16' : 'w-64'} bg-pingspot-gradient
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? '' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div>

                    <div className="flex flex-col h-full">
                        <div className={`justify-center ${collapsed ? 'p-4' : 'p-6'} border-b  border-white`}>
                            <div className="backdrop-blur-md bg-white/20 border border-white rounded-xl shadow-lg flex justify-start w-full">
                                <div>
                                    <PingspotLogo size='170' />
                                </div>
                            </div>

                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2 h-fit">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        router.push(`/main/${item.id}`)
                                        setCurrentPage(item.id);
                                    }}
                                    className={`
                                    w-full flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                                    transition-all duration-200 group relative
                                    ${item.id === currentPath
                                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25' 
                                        : 'text-gray-200 hover:bg-gray-700/50 hover:text-white'
                                    }
                                    `}
                                >
                                    <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                                    {!collapsed && (
                                    <>
                                        <span className="ml-3 font-medium">{item.label}</span>
                                        {item.badge && (
                                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
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

                        <div className="px-4 py-4 border-t border-white space-y-2">
                            {bottomNavigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    router.push(`/main/${item.id}`)
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
                            
                            <button
                                onClick={handleLogout}
                                disabled={isPending}
                                className={`
                                w-full flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                                ${isPending 
                                    ? 'text-red-400 bg-red-600/10 cursor-not-allowed' 
                                    : 'text-red-300 hover:bg-red-600/20 hover:text-red-200'
                                } transition-colors
                                `}
                            >
                                <ImExit className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${isPending ? 'animate-pulse' : ''}`} />
                                {!collapsed && (
                                    <span className="ml-3 font-medium">
                                        {isPending ? 'Keluar...' : 'Keluar'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {!collapsed && (
                    <div className="fixed right-1/4 top-1/2 sm:right-1/3 md:right-1/3 ">
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600/50 
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={onToggle}
                />
            )}
        </>
    )
}

export default Sidebar;