/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import MainLayout from '@/layouts/MainLayout'
import dynamic from 'next/dynamic';
import React from 'react'
import { BiPlus } from 'react-icons/bi'
import { FaMap, FaUsers } from 'react-icons/fa'
import { GoAlert } from 'react-icons/go'
import { LuActivity } from 'react-icons/lu'

const Map = dynamic(() => import("../components/Map"), {
    ssr: false,
});

const Homepage = () => {
    return (
        <MainLayout>
            <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Selamat Datang di PingSpot! 👋
                        </h1>
                        <p className="text-gray-600 text-lg">
                        Kelola laporan dan pantau kondisi lingkungan sekitar Anda secara real-time.
                        </p>
                    </div>
                    <button className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center space-x-2">
                        <BiPlus className="w-5 h-5" />
                        <span>Buat Laporan Baru</span>
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                    { title: 'Total Laporan', value: '1,234', change: '+12%', color: 'from-blue-500 to-blue-600', icon: GoAlert },
                    { title: 'Laporan Aktif', value: '89', change: '+5%', color: 'from-orange-500 to-orange-600', icon: LuActivity },
                    { title: 'Komunitas', value: '567', change: '+8%', color: 'from-green-500 to-green-600', icon: FaUsers },
                    { title: 'Area Terpantau', value: '23', change: '+2%', color: 'from-purple-500 to-purple-600', icon: FaMap },
                    ].map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6">
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-green-600 font-medium">{stat.change} dari bulan lalu</p>
                        </div>
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        </div>
                    </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <LuActivity className="w-6 h-6 text-sky-600 mr-2" />
                            Aktivitas Terbaru
                        </h2>
                        <div className="space-y-4">
                            {[
                            { action: 'Laporan baru', desc: 'Jalan rusak di Jl. Sudirman', time: '5 menit lalu', status: 'new' },
                            { action: 'Status update', desc: 'Perbaikan lampu jalan selesai', time: '1 jam lalu', status: 'resolved' },
                            { action: 'Komentar baru', desc: 'Warga merespon laporan Anda', time: '2 jam lalu', status: 'comment' },
                            ].map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                activity.status === 'new' ? 'bg-orange-400' :
                                activity.status === 'resolved' ? 'bg-green-400' : 'bg-blue-400'
                                }`} />
                                <div className="flex-1">
                                <p className="font-medium text-gray-900">{activity.action}</p>
                                <p className="text-gray-600 text-sm">{activity.desc}</p>
                                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                    <Map/>
                </div>
            </div>
        </MainLayout>
    )
}

export default Homepage