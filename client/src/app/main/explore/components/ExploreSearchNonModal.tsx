import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaMap, FaUsers, FaSearch } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';
import { BiX } from 'react-icons/bi';
import { InputField } from '@/components/form';

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
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalSearchTerm(searchTerm);
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

    const handleSearch = () => {
        onSearchChange(localSearchTerm);
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

                            {localSearchTerm && (
                                <div className="p-8 text-center border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                                        <FaUsers className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                        Tidak Ada Hasil
                                    </h4>
                                    <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                        Tidak ditemukan hasil untuk pencarian Anda. Coba kata kunci lain.
                                    </p>
                                </div>
                            )}
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