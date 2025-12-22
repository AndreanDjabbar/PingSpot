/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaMap, FaUsers, FaSearch } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';
import SearchResultTabs, { TabType } from './SearchResultTabs';

interface SearchResult {
    users: any[];
    reports: any[];
    communities: any[];
}

interface ExploreSearchNonModalProps {
    searchTerm: string;
    isOpen: boolean;
    onClose: () => void;
    onSearchChange: (value: string) => void;
}

const ExploreSearchNonModal: React.FC<ExploreSearchNonModalProps> = ({ 
    searchTerm, 
    isOpen, 
    onClose,
    onSearchChange 
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [searchResults, setSearchResults] = useState<SearchResult>({
        users: [],
        reports: [],
        communities: []
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalSearchTerm(searchTerm);
        
        // TODO: Replace with actual API call
        // Mock data for demonstration
        if (searchTerm) {
            setSearchResults({
                users: [
                    { id: 1, username: 'john_doe', fullName: 'John Doe', profilePicture: null },
                    { id: 2, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 3, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 4, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 5, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 6, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 7, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 8, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 9, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 10, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 11, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 12, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 13, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                    { id: 14, username: 'jane_smith', fullName: 'Jane Smith', profilePicture: null },
                ],
                reports: [
                    { id: 1, title: 'Jalan Rusak', type: 'infrastructure', status: 'open' },
                    { id: 2, title: 'Lampu Jalan Mati', type: 'infrastructure', status: 'progress' },
                    { id: 3, title: 'Sampah Menumpuk', type: 'environment', status: 'open' }
                ],
                communities: [
                    { id: 1, name: 'Komunitas Peduli Lingkungan', members: 150 },
                    { id: 2, name: 'Komunitas Kucing Peduli', members: 80 }
                ]
            });
        } else {
            setSearchResults({
                users: [],
                reports: [],
                communities: []
            });
        }
    }, [searchTerm]);

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

    const renderResults = () => {
        const results = searchResults[activeTab];
        
        if (results.length === 0) {
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
                {activeTab === 'users' && results.map((user: any) => (
                    <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
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
                {activeTab === 'reports' && results.map((report: any) => (
                    <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <GoAlert className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{report.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{report.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        report.status === 'open' ? 'bg-red-100 text-red-700' :
                                        report.status === 'progress' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>{report.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {activeTab === 'communities' && results.map((community: any) => (
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
                            {localSearchTerm && (
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Hasil Pencarian
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Menampilkan hasil untuk <span className="font-semibold text-sky-700">&ldquo;{localSearchTerm}&rdquo;</span>
                                    </p>
                                </div>
                            )}

                            {localSearchTerm && (
                                <SearchResultTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    userCount={searchResults.users.length}
                                    reportCount={searchResults.reports.length}
                                    communityCount={searchResults.communities.length}
                                />
                            )}

                            
                            {!localSearchTerm && (
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

                            {localSearchTerm && renderResults()}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd>
                                        untuk cari
                                    </span>
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