import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { FaCheckCircle } from 'react-icons/fa';
import { MdOutlineNoteAlt, MdTrackChanges } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { IoMdImages } from "react-icons/io";
import { LuNotebookText } from "react-icons/lu";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { Accordion } from '@/components';
import { IEditReportRequest } from '@/types';

interface SummaryStepProps {
    watch: UseFormWatch<IEditReportRequest>;
    reportImagesCount: number;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ watch, reportImagesCount }) => {
    const issueTypes = [
        { value: 'infrastructure', label: 'Infrastruktur' },
        { value: 'environment', label: 'Lingkungan' },
        { value: 'safety', label: 'Keamanan' },
        { value: 'traffic', label: 'Lalu Lintas' },
        { value: 'public_facility', label: 'Fasilitas Umum' },
        { value: 'waste', label: 'Sampah' },
        { value: 'water', label: 'Air' },
        { value: 'electricity', label: 'Listrik' },
        { value: 'health', label: 'Kesehatan' },
        { value: 'social', label: 'Sosial' },
        { value: 'education', label: 'Pendidikan' },
        { value: 'administrative', label: 'Administrasi' },
        { value: 'disaster', label: 'Bencana Alam' },
        { value: 'other', label: 'Lainnya' },
    ];

    const hasProgressValue = watch('hasProgress');

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border-l-4 border-amber-400">
                <div className="flex items-center gap-3">
                    <div className="">
                        <BsFillInfoCircleFill className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            Pastikan semua informasi sudah benar sebelum mengirim laporan.
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                            Anda dapat kembali ke langkah sebelumnya untuk memeriksa atau mengubah data.
                        </p>
                    </div>
                </div>
            </div>

            <Accordion type="single" defaultValue={['summary']}>
                <Accordion.Item
                    id="summary"
                    title="Ringkasan Laporan"
                    icon={<FaCheckCircle className="w-5 h-5 text-gray-700" />}
                    headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50"
                    className="border-2 border-gray-300"
                >
                    <Accordion type="multiple" defaultValue={['info', 'location', 'description', 'attachment']} className='mt-4'>
                        <Accordion.Item
                            id="info"
                            title="Informasi Dasar"
                            icon={<LuNotebookText className="w-5 h-5 text-gray-700" />}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Judul Laporan
                                    </label>
                                    <p className="text-base text-gray-900 mt-1 font-medium">
                                        {watch('reportTitle') || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Jenis Laporan
                                    </label>
                                    <p className="text-base text-gray-900 mt-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {issueTypes.find(t => t.value === watch('reportType'))?.label || '-'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Fitur Progress
                                    </label>
                                    <p className="text-base text-gray-900 mt-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${hasProgressValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {hasProgressValue && <MdTrackChanges size={16} />}
                                            {hasProgressValue ? 'Diaktifkan' : 'Tidak Diaktifkan'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Accordion.Item>

                        <Accordion.Item
                            id="location"
                            title="Lokasi"
                            icon={<IoLocationOutline className="w-5 h-5 text-gray-700" />}
                        >
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Detail Lokasi
                                </label>
                                <p className="text-base text-gray-900 mt-1">
                                    {watch('location') || '-'}
                                </p>
                            </div>
                        </Accordion.Item>

                        <Accordion.Item
                            id="description"
                            title="Deskripsi Permasalahan"
                            icon={<MdOutlineNoteAlt className="w-5 h-5 text-gray-700" />}
                        >
                            <div>
                                <p className="text-base text-gray-700 leading-relaxed">
                                    {watch('reportDescription') || '-'}
                                </p>
                            </div>
                        </Accordion.Item>

                        <Accordion.Item
                            id="attachment"
                            title="Lampiran Foto"
                            icon={<IoMdImages className="w-5 h-5 text-gray-700" />}
                        >
                            <div>
                                {reportImagesCount > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-base text-gray-900 font-medium">
                                            {reportImagesCount} foto dilampirkan
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-base text-gray-500 italic">
                                        Tidak ada foto yang dilampirkan
                                    </p>
                                )}
                            </div>
                        </Accordion.Item>
                    </Accordion>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default SummaryStep;
