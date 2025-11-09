"use client";

import React from 'react';
import Image from 'next/image';
import { BsThreeDots } from 'react-icons/bs';
import { FaCrown, FaMapMarkerAlt } from 'react-icons/fa';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { IReport, ReportType } from '@/types/model/report';
import { useUserProfileStore } from '@/stores';

interface ReportHeaderProps {
    report: IReport;
}

const getReportTypeLabel = (type: ReportType): string => {
    const types: Record<ReportType, string> = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya',
        TRAFFIC: 'Lalu Lintas',
        PUBLIC_FACILITY: 'Fasilitas Umum',
        WASTE: 'Sampah',
        WATER: 'Air',
        ELECTRICITY: 'Listrik',
        HEALTH: 'Kesehatan',
        SOCIAL: 'Sosial',
        EDUCATION: 'Pendidikan',
        ADMINISTRATIVE: 'Administratif',
        DISASTER: 'Bencana Alam'
    };
    return types[type] || 'Lainnya';
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const isReportOwner = userProfile ? Number(userProfile.userID) === report.userID : false;
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                            src={getImageURL(report.profilePicture || '', "user")}
                            alt={report.fullName}
                            width={48}
                            height={48}
                            className="object-cover h-full w-full"
                        />
                    </div>
                    <div>
                        <div className='flex items-center gap-2'>
                            <div className="font-semibold text-base text-gray-900">{report.userName}</div>
                            <div>
                                {isReportOwner && (  
                                    <FaCrown size={14} className='text-amber-500'/>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {formattedDate(report.reportCreatedAt, {
                                formatStr: 'dd MMMM yyyy - HH:mm',
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-sm font-semibold text-blue-700 rounded-full">
                        {getReportTypeLabel(report.reportType)}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <BsThreeDots size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{report.reportTitle}</h1>
            <p className="text-base text-gray-700 leading-relaxed mb-4">{report.reportDescription}</p>

            <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <FaMapMarkerAlt className="mt-1 text-red-500 flex-shrink-0" size={16} />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{report?.location?.detailLocation}</p>
                    {report?.location?.displayName && (
                        <p className="text-xs text-gray-600 mt-1">{report?.location?.displayName}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
