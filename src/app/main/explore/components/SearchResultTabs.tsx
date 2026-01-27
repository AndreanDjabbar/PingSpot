import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUsers } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';
import { TabType } from '@/types';

interface SearchResultTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    userCount: number;
    reportCount: number;
    communityCount: number;
}

const SearchResultTabs: React.FC<SearchResultTabsProps> = ({
    activeTab,
    onTabChange,
    userCount,
    reportCount,
    communityCount
}) => {
    const tabs = [
        { id: 'users' as TabType, label: 'Pengguna', icon: FaUser, count: userCount },
        { id: 'reports' as TabType, label: 'Laporan', icon: GoAlert, count: reportCount },
        { id: 'communities' as TabType, label: 'Komunitas', icon: FaUsers, count: communityCount }
    ];

    return (
        <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto overflow-y-hidden relative">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative isolate hover:cursor-pointer ${
                                isActive
                                    ? 'text-sky-700 bg-sky-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <motion.div 
                                className="flex items-center justify-center gap-2 whitespace-nowrap"
                                initial={false}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut"
                                }}
                            >
                                <motion.div
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                </motion.div>
                                
                                <motion.span 
                                    className="flex-shrink-0"
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut"
                                    }}
                                >
                                    {tab.label}
                                </motion.span>
                                
                                <AnimatePresence mode="wait">
                                    <motion.span 
                                        key={`${tab.id}-${tab.count}`}
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                            isActive
                                                ? 'bg-sky-200 text-sky-800'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeOut"
                                        }}
                                    >
                                        {tab.count}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.div>
                            
                            {isActive && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ 
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                    style={{ transformOrigin: 'center' }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchResultTabs;