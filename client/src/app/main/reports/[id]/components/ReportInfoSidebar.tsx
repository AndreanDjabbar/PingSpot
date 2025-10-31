"use client";

import React from 'react';
import { IReport, ReportType } from '@/types/model/report';
import { getFormattedDate as formattedDate } from '@/utils';

interface ReportInfoSidebarProps {
    report: IReport;
    getReportTypeLabel: (type: ReportType) => string;
}

export const ReportInfoSidebar: React.FC<ReportInfoSidebarProps> = ({ 
    report, 
    getReportTypeLabel 
}) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Informasi Laporan</h3>
            <div className="space-y-3">
                {report.hasProgress ? (
                    <>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                report.reportStatus === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                report.reportStatus === 'NOT_RESOLVED' ? 'bg-red-100 text-red-800' :
                                report.reportStatus === 'ON_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {report.reportStatus === 'RESOLVED' ? 'Terselesaikan' :
                                report.reportStatus === 'NOT_RESOLVED' ? 'Belum Terselesaikan' :
                                report.reportStatus === 'ON_PROGRESS' ? 'Dalam Proses' : 'Menunggu'}
                            </span>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="text-xs text-gray-600 font-medium">Tipe Laporan Tidak Menggunakan Status</span>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                    </>
                )}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dilaporkan</p>
                    <p className="text-sm text-gray-900">
                        {formattedDate(report.reportCreatedAt, {
                            formatStr: 'dd MMMM yyyy',
                        })}
                    </p>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kategori</p>
                    <p className="text-sm text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                </div>
            </div>
        </div>
    );
};
