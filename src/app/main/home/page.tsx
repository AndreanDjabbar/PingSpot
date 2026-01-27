/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from 'react'
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { BiPlus } from 'react-icons/bi'
import { FaUser } from 'react-icons/fa'
import { GoAlert } from 'react-icons/go'
import HeaderSection from '../components/HeaderSection';
import { useLocationStore } from '@/stores';
import { Button, EmptyState, Loading, ErrorSection } from '@/components';
import { RxCrossCircled } from 'react-icons/rx';
import { FaLocationDot } from 'react-icons/fa6';
import { useCurrentLocation, useGetReportStatistics, useErrorToast, useGetUserStatistics } from '@/hooks';
import { getErrorResponseMessage, getFormattedDate, getRelativeTime, isInternalServerError } from '@/utils';
import { IoMdPulse } from 'react-icons/io';
import { MdCalendarMonth } from 'react-icons/md';

const Map = dynamic(() => import('@/app/main/components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

const Homepage = () => {
    const currentPath = usePathname();
    const router = useRouter();
    const location = useLocationStore((state) => state.location);
    const { 
        requestLocation, 
        loading: loadingRequestLocation, 
        permissionDenied, 
        isPermissionDenied, 
    } = useCurrentLocation();

    const {
        data: reportStatisticsData,
        isLoading: loadingReportStatistics,
        isError: isErrorReportStatistics,
        refetch: refetchReportStatistics,
        error: errorReportStatistics
    } = useGetReportStatistics();

    const {
        data: userStatisticsData,
        isLoading: loadingUserStatistics,
        refetch: refetchUserStatistics,
        isError: isErrorUserStatistics,
        error: errorUserStatistics
    } = useGetUserStatistics();

    useErrorToast(isPermissionDenied, permissionDenied);

    const isReportStatisticServerError = isInternalServerError(errorReportStatistics);
    const isUserStatisticServerError = isInternalServerError(errorUserStatistics);

    const totalReports = reportStatisticsData?.data?.totalReports || 0;
    const totalActiveReports = (reportStatisticsData?.data?.reportsByStatus["ON_PROGRESS"] || 0) + (reportStatisticsData?.data?.reportsByStatus["WAITING"] || 0);
    const today = Date.now();
    const thisMonth = getFormattedDate(today, {
        formatStr: 'yyyy-MM',
    });
    const totalReportsThisMonth = reportStatisticsData?.data?.monthlyReportCounts[thisMonth] || 0;
    const totalUsers = userStatisticsData?.data?.totalUsers || 0;
    
    const reportErrorSection = (
        <ErrorSection 
        errors={errorReportStatistics}
        message={getErrorResponseMessage(errorReportStatistics)}
        onRetry={() => refetchReportStatistics}
        showRetryButton={isReportStatisticServerError}
        />
    ) 

    const userErrorSection = (
        <ErrorSection 
        errors={errorUserStatistics}
        message={getErrorResponseMessage(errorUserStatistics)}
        onRetry={() => refetchUserStatistics}
        showRetryButton={isUserStatisticServerError}
        />
    ) 

    return (
        <div className="space-y-8">
            <HeaderSection 
            currentPath={currentPath}
            message='Kelola laporan dan pantau kondisi lingkungan sekitar Anda secara real-time.'>
                <button 
                    className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
                    onClick={() => router.push('/main/reports/create-report')}>
                    <BiPlus className="w-5 h-5" />
                    <span>Buat Laporan</span>
                </button>
            </HeaderSection>

            <div className='flex w-full justify-between gap-10'>
                {isErrorReportStatistics && (
                    <div className='w-1/2'>
                        {reportErrorSection}
                    </div>
                )}
                {isErrorUserStatistics && (
                    <div className='w-1/2'>
                        {userErrorSection}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                    {loadingReportStatistics ? (
                        <div className='pt-3'>
                            <Loading type='dots'text='Memuat...'/>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Laporan</p>
                                <p className="text-xl font-bold text-gray-900">{totalReports} Laporan</p>
                                <p className="text-sm text-green-600 font-medium"></p>
                            </div>
                            <div className={`p-3 rounded-lg bg-sky-800`}>
                                <GoAlert className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                        {loadingReportStatistics ? (
                            <div className='pt-3'>
                                <Loading type='dots'text='Memuat...'/>
                            </div>
                        ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Laporan Aktif</p>
                                <p className="text-xl font-bold text-gray-900">{totalActiveReports} Laporan</p>
                                <p className="text-sm text-green-600 font-medium"></p>
                            </div>
                            <div className={`p-3 rounded-lg bg-sky-800`}>
                                <IoMdPulse className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                    {loadingReportStatistics ? (
                        <div className='pt-3'>
                            <Loading type='dots'text='Memuat...'/>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Laporan Bulan Ini</p>
                                <p className="text-xl font-bold text-gray-900">{totalReportsThisMonth} Laporan</p>
                                <p className="text-sm text-green-600 font-medium"></p>
                            </div>
                            <div className={`p-3 rounded-lg bg-sky-800`}>
                                <MdCalendarMonth className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                {loadingUserStatistics ? (
                        <div className='pt-3'>
                            <Loading type='dots'text='Memuat...'/>
                        </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Pengguna Aktif</p>
                            <p className="text-xl font-bold text-gray-900">{totalUsers} Pengguna</p>
                            <p className="text-sm text-green-600 font-medium"></p>
                        </div>
                        <div className={`p-3 rounded-lg bg-sky-800`}>
                            <FaUser className="w-6 h-6 text-white" />
                        </div>
                    </div>
                )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                    <div className='flex justify-between items-center mb-4'>
                        <div className='flex flex-col'>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Lokasi Anda
                            </h2>
                            {location?.lastUpdated && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Diperbarui {getRelativeTime(location.lastUpdated)}
                                </p>
                            )}
                        </div>
                        <Button 
                        size='sm'
                        isLoading={loadingRequestLocation}
                        loadingText='Memperbarui...'
                        onClick={() => {
                            requestLocation(true)
                        }}>
                            Perbarui Lokasi
                        </Button>
                    </div>
                    {location !== null ? (
                        <div className="space-y-4 h-full">
                            <div className='h-full'>
                                <Map 
                                latitude={Number(location?.lat)}
                                height={400}
                                longitude={Number(location?.lng)}
                                />
                            </div>
                        </div>

                    ) : (
                        <div className="space-y-4 h-full">
                            <div className='h-full'>
                                <EmptyState
                                    emptyTitle='Lokasi tidak tersedia'
                                    emptyMessage='Untuk menampilkan laporan di sekitar Anda, izinkan aplikasi mengakses lokasi Anda.'
                                    emptyIcon={<RxCrossCircled />}
                                    showCommandButton={true}
                                    commandLabel='Deteksi Lokasi'
                                    commandLoading={loadingRequestLocation}
                                    commandIcon={<FaLocationDot/>}
                                    commandLoadingMessage='Mendeteksi...'
                                    onCommandButton={() => {requestLocation()}}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        Aktivitas Terbaru
                    </h2>
                    <h4 className='text-gray-500'>
                        Fitur ini akan segera hadir. Nantikan pembaruan selanjutnya!
                    </h4>
                    {/* <div className="space-y-4">
                        {[
                        { action: 'Laporan baru', desc: 'Jalan rusak di Jl. Sudirman', time: '5 menit lalu', status: 'new' },
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
                    </div> */}
                </div>
                {/* <Map/> */}
            </div>
        </div>
    )
}

export default Homepage