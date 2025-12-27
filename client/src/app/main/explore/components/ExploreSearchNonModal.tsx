/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUsers, FaSearch } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';
import SearchResultTabs, { TabType } from './SearchResultTabs';
import { ISearchDataResponse } from '@/types/api/search';
import { IUserProfile } from '@/types/model/user';
import { IReport } from '@/types/model/report';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface SearchResult {
    users: IUserProfile[];
    reports: IReport[];
    communities: any[];
}

interface ExploreSearchNonModalProps {
    searchTerm: string;
    isOpen: boolean;
    searchData: ISearchDataResponse | null;
    onClose: () => void;
    onSearchChange: (value: string) => void;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
}

const ExploreSearchNonModal: React.FC<ExploreSearchNonModalProps> = ({ 
    searchTerm, 
    isOpen, 
    onClose,
    onSearchChange,
    searchData,
    isLoading = false,
    isError = false,
    error = null
}) => {
    const reportsData = searchData?.data?.reportsData?.reports || [];
    const usersData = searchData?.data?.usersData?.users || [];
    console.log('ExploreSearchNonModal searchData:', searchData);

    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [searchResults, setSearchResults] = useState<SearchResult>({
        users: [],
        reports: [],
        communities: []
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setSearchResults({
                users: [],
                reports: [],
                communities: []
            });
            return;
        }


        if (!isLoading && searchData) {
            setSearchResults({
                users: usersData,
                reports: reportsData,
                communities: []
            });
        }
    }, [searchTerm, reportsData, usersData, isLoading, searchData]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const renderLoadingState = () => (
        <div className="p-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 mb-4">
                <AiOutlineLoading3Quarters className="w-7 h-7 text-sky-600 animate-spin" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Mencari...
            </h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
                Sedang mencari {activeTab === 'users' ? 'pengguna' : activeTab === 'reports' ? 'laporan' : 'komunitas'}
            </p>
        </div>
    );

    const renderErrorState = () => (
        <div className="p-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <GoAlert className="w-7 h-7 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Terjadi Kesalahan
            </h4>
            <p className="text-gray-600 text-sm max-w-xs mx-auto mb-4">
                {error?.message || 'Gagal memuat hasil pencarian. Silakan coba lagi.'}
            </p>
            <button
                onClick={() => onSearchChange(searchTerm)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
            >
                Coba Lagi
            </button>
        </div>
    );

    const renderResults = () => {
        if (isLoading) {
            return renderLoadingState();
        }

        if (isError) {
            return renderErrorState();
        }

        const results = searchResults[activeTab];
        
        if (searchTerm.length < 3) {
            return (
                <div className="p-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                        <FaSearch className="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Mulai Pencarian Anda
                    </h4>
                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        Ketik minimal 3 karakter untuk mencari {activeTab === 'users' ? 'pengguna' : activeTab === 'reports' ? 'laporan' : 'komunitas'}
                    </p>
                </div>
            )
        }

        if (results.length === 0 && searchTerm.length >= 3) {
            return (
                <div className="p-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                        <FaSearch className="w-7 h-7 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Tidak Ada Hasil
                    </h4>
                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        Tidak ditemukan {activeTab === 'users' ? 'pengguna' : activeTab === 'reports' ? 'laporan' : 'komunitas'} untuk pencarian Anda.
                    </p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-200">
                {activeTab === 'users' && searchResults.users.map((user) => (
                    <div key={user.userID} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                                <FaUser className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{user.fullName}</p>
                                <p className="text-sm text-gray-600">@{user.username}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {activeTab === 'reports' && searchResults.reports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <GoAlert className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{report.reportTitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{report.reportType}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        report.reportStatus === "WAITING" ? 'bg-red-100 text-red-700' :
                                        report.reportStatus === 'ON_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>{report.reportStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {activeTab === 'communities' && searchResults.communities.map((community) => (
                    <div key={community.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <FaUsers className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{community.name}</p>
                                <p className="text-sm text-gray-600">{community.members} members</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.20, ease: "easeOut" }}
                >   
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                            {searchTerm && searchTerm.length >= 3 && (
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700">
                                                Hasil Pencarian
                                            </h3>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Menampilkan hasil untuk <span className="font-semibold text-sky-700">&ldquo;{searchTerm}&rdquo;</span>
                                            </p>
                                        </div>
                                        {isLoading && (
                                            <AiOutlineLoading3Quarters className="w-4 h-4 text-sky-600 animate-spin" />
                                        )}
                                    </div>
                                </div>
                            )}
            
                            {searchTerm && (
                                <SearchResultTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    userCount={searchResults.users.length}
                                    reportCount={searchResults.reports.length}
                                    communityCount={searchResults.communities.length}
                                />
                            )}

                            
                            {!searchTerm && (
                                <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                                        <FaSearch className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                        Mulai Pencarian Anda
                                    </h4>
                                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                        Ketik kata kunci untuk mencari pengguna, laporan, lokasi, atau komunitas
                                    </p>
                                </div>
                            )}

                            {searchTerm && renderResults()}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd>
                                        untuk tutup
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExploreSearchNonModal;