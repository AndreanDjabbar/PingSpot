"use client";

import React, { useMemo, memo } from 'react';
import { useReportsStore } from '@/stores';

const reportTypeConfig: Record<string, { label: string; color: string }> = {
    totalInfrastructureReports: { label: 'Infrastruktur', color: 'text-blue-600' },
    totalEnvironmentReports: { label: 'Lingkungan', color: 'text-green-600' },
    totalSafetyReports: { label: 'Keamanan', color: 'text-red-600' },
    totalTrafficReports: { label: 'Lalu Lintas', color: 'text-orange-600' },
    totalPublicFacilityReports: { label: 'Fasilitas Umum', color: 'text-purple-600' },
    totalWasteReports: { label: 'Sampah', color: 'text-yellow-600' },
    totalWaterReports: { label: 'Air', color: 'text-cyan-600' },
    totalElectricityReports: { label: 'Listrik', color: 'text-amber-600' },
    totalHealthReports: { label: 'Kesehatan', color: 'text-pink-600' },
    totalSocialReports: { label: 'Sosial', color: 'text-indigo-600' },
    totalEducationReports: { label: 'Pendidikan', color: 'text-teal-600' },
    totalAdministrativeReports: { label: 'Administrasi', color: 'text-slate-600' },
    totalDisasterReports: { label: 'Bencana Alam', color: 'text-rose-600' },
    totalOtherReports: { label: 'Lainnya', color: 'text-gray-600' },
};

export const ReportSidebar = memo(() => {
    const reportCount = useReportsStore((state) => state.reportCount);

    const reportStats = useMemo(() => {
        if (!reportCount) return [];
        
        return Object.entries(reportCount)
            .filter(([key, value]) => key !== 'totalReports' && value > 0)
            .map(([key, value]) => ({
                key,
                label: reportTypeConfig[key]?.label || key,
                color: reportTypeConfig[key]?.color || 'text-gray-600',
                count: value,
            }));
    }, [reportCount]);

    return (
        <div className='hidden lg:block w-1/3 lg:w-75 2xl:w-90 overflow-y-auto space-y-4'>
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5'>
                <h3 className='font-bold text-lg text-gray-900 mb-3'>
                    Tentang PingSpot
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed mb-4'>
                    PingSpot adalah platform pelaporan masalah komunitas yang memungkinkan warga melaporkan dan memantau permasalahan di lingkungan sekitar.
                </p>
                <div className='space-y-2'>
                    <div className='flex items-center text-sm text-gray-700'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                        <span>Laporkan masalah infrastruktur</span>
                    </div>
                    <div className='flex items-center text-sm text-gray-700'>
                        <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
                        <span>Pantau status penanganan</span>
                    </div>
                    <div className='flex items-center text-sm text-gray-700'>
                        <div className='w-2 h-2 bg-purple-500 rounded-full mr-3'></div>
                        <span>Berpartisipasi dalam komunitas</span>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5'>
                <h3 className='font-bold text-lg text-gray-900 mb-4'>
                    Statistik Laporan
                </h3>
                <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                        <span className='text-gray-600 text-sm'>Total Laporan</span>
                        <span className='font-semibold text-gray-900'>{reportCount?.totalReports || 0}</span>
                    </div>
                    {reportStats.length > 0 && (
                        <>
                            <div className='h-px bg-gray-200'></div>
                            {reportStats.map((stat) => (
                                <div key={stat.key} className='flex justify-between items-center'>
                                    <span className='text-gray-600 text-sm'>{stat.label}</span>
                                    <span className={`font-semibold ${stat.color}`}>
                                        {stat.count}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Teman</h3>
                    <span className="text-xs text-gray-500">24 online</span>
                </div>

                <div className="space-y-3">
                    {[
                        { name: 'Ahmad Rizki', status: 'online', avatar: 'AR' },
                        { name: 'Siti Nurhaliza', status: 'online', avatar: 'SN' },
                        { name: 'Budi Santoso', status: 'offline', avatar: 'BS' },
                        { name: 'Dewi Kartika', status: 'online', avatar: 'DK' },
                    ].map((friend, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {friend.avatar}
                                </div>
                                <div
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                ></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{friend.name}</p>
                                <p className="text-xs text-gray-500">
                                    {friend.status === 'online' ? 'Aktif sekarang' : 'Terakhir dilihat 2j'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Lihat Semua Teman
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Komunitas Aktif</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Warga Peduli Jakarta', members: 1245, color: 'bg-blue-500' },
                        { name: 'Tim Hijau Indonesia', members: 892, color: 'bg-green-500' },
                        { name: 'Keamanan Lingkungan', members: 567, color: 'bg-red-500' },
                    ].map((community, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div
                                className={`w-12 h-12 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                            >
                                {community.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{community.name}</p>
                                <p className="text-xs text-gray-500">{community.members.toLocaleString()} anggota</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Jelajahi Komunitas
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Saran Komunitas</h3>
                <div className="space-y-3">
                    {[
                        { title: 'Relawan Bersih Pantai', category: 'Lingkungan', members: 234 },
                        { title: 'Patroli Malam Aman', category: 'Keamanan', members: 156 },
                        { title: 'Perbaikan Jalan Bersama', category: 'Infrastruktur', members: 389 },
                    ].map((suggestion, idx) => (
                        <div
                            key={idx}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">{suggestion.title}</h4>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    {suggestion.category}
                                </span>
                                <span className="text-xs text-gray-500">{suggestion.members} anggota</span>
                            </div>
                            <button className="w-full mt-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                                Bergabung
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

ReportSidebar.displayName = 'ReportSidebar';
