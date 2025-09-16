"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField, ButtonSubmit, TextAreaField, RadioField, ImageField } from '@/components/form';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';
import { MdOutlineCategory } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { LuNotebookText } from "react-icons/lu";
import ErrorSection from '@/components/UI/ErrorSection';
import SuccessSection from '@/components/UI/SuccessSection';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import { getDataResponseMessage } from '@/utils/getDataResponse';
import useErrorToast from '@/hooks/useErrorToast';
import useSuccessToast from '@/hooks/useSuccessToast';
import dynamic from 'next/dynamic';
import { ReportSchema, ReportFormType } from '../schema';
import 'leaflet/dist/leaflet.css';

const DynamicMap = dynamic(() => import('../components/DynamicMap'), {
    ssr: false,
});

const ReportsPage = () => {
    const currentPath = usePathname();
    const [reportImage, setReportImage] = useState<File | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch
    } = useForm<ReportFormType>({
        resolver: zodResolver(ReportSchema),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [responseData, setResponseData] = useState<{ message: string } | null>(null);
    const [responseError, setResponseError] = useState<{ message: string, details?: Record<string, string[]> } | null>(null);

    const reportTypeValue = watch('reportType');

    useEffect(() => {
        if (markerPosition) {
            setValue('latitude', markerPosition.lat.toString());
            setValue('longitude', markerPosition.lng.toString());
        }
    }, [markerPosition, setValue]);

    const onSubmit = (data: ReportFormType) => {
        setIsSubmitting(true);
        const formData = {
        ...data,
        image: reportImage
        };

        console.log("Submitting report data:", formData);
        
        setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setResponseData({ message: "Laporan berhasil dikirim!" });

        if (isError) {
            setIsError(false);
            setResponseError(null);
        }
        reset();
        setReportImage(null);
        setMarkerPosition(null);
        }, 1000);
    };

    useErrorToast(isError, responseError);
    useSuccessToast(isSuccess, responseData);

    const issueTypes = [
        { value: 'infrastructure', label: 'Infrastruktur' },
        { value: 'environment', label: 'Lingkungan' },
        { value: 'safety', label: 'Keamanan' },
        { value: 'other', label: 'Lainnya' }
    ];

    return (
        <div className="space-y-8">
        <HeaderSection 
            currentPath={currentPath}
            message="Laporkan masalah atau kerusakan di sekitar Anda untuk membantu perbaikan lingkungan."
        />

        {isSuccess && (
            <SuccessSection message={responseData ? getDataResponseMessage(responseData) : "Laporan berhasil dikirim!"} />
        )}

        {isError && (
            <ErrorSection 
            message={getErrorResponseMessage(responseError)} 
            errors={getErrorResponseDetails(responseError)} 
            />
        )}

        {!isSuccess && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-8 w-full" encType="multipart/form-data">
                    <div className="w-full flex flex-col gap-6">
                        <div className="w-full bg-gradient-to-br from-sky-100 to-indigo-100 rounded-lg p-4 border-2 border-dashed border-sky-200">
                            <h2 className="text-xl font-semibold text-sky-800 mb-4 flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            Pilih Lokasi
                            </h2>
                            <p className="text-gray-600 mb-4 text-sm">Klik pada peta untuk menentukan lokasi masalah atau aktifkan lokasi otomatis</p>
                            <div className="h-[400px] w-full mb-4">
                                <DynamicMap onMarkerPositionChange={setMarkerPosition}/>
                            </div>
                            <input 
                            type="hidden" 
                            {...register('latitude')}
                            />
                            <input 
                            type="hidden" 
                            {...register('longitude')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="w-full">
                                <InputField
                                    id="title"
                                    register={register("title")}
                                    type="text"
                                    className="w-full"
                                    withLabel={true}
                                    labelTitle="Judul Laporan"
                                    icon={<LuNotebookText size={20} />}
                                    placeHolder="Masukkan judul laporan"
                                />
                                <div className="text-red-500 text-sm font-semibold">{errors.title?.message as string}</div>
                            </div>

                            <div className="w-full">
                                <InputField
                                    id="location"
                                    register={register("location")}
                                    type="text"
                                    className="w-full"
                                    withLabel={true}
                                    labelTitle="Alamat/Detail Lokasi"
                                    icon={<IoLocationOutline size={20} />}
                                    placeHolder="Detail alamat lokasi permasalahan"
                                />
                                <div className="text-red-500 text-sm font-semibold">{errors.location?.message as string}</div>
                            </div>
                        </div>

                        <div className="w-full">
                            <TextAreaField
                            id="description"
                            register={register("description")}
                            rows={4}
                            className="w-full"
                            withLabel={true}
                            labelTitle="Deskripsi Permasalahan"
                            icon={<BiMessageDetail size={20} />}
                            placeHolder="Jelaskan permasalahan dengan detail"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.description?.message as string}</div>
                        </div>

                        <div className="w-full">
                            <RadioField
                            id="reportType"
                            name="reportType"
                            value={reportTypeValue || ''}
                            register={register("reportType")}
                            withLabel={true}
                            labelTitle="Jenis Laporan"
                            icon={<MdOutlineCategory size={20} />}
                            options={issueTypes}
                            layout="horizontal"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.reportType?.message as string}</div>
                        </div>

                        <div className="w-full">
                            <div className=''>
                                <ImageField
                                id="reportImage"
                                withLabel={true}
                                labelTitle="Foto Permasalahan"
                                buttonTitle="Pilih Foto"
                                width={420}
                                height={420}
                                shape="square"
                                onChange={(file) => setReportImage(file)}
                                />
                            </div>
                            <p className="text-sm text-center text-gray-500 mt-1">
                            Unggah foto untuk membantu identifikasi masalah (opsional)
                            </p>
                        </div>

                        <div className="w-full flex justify-end mt-6">
                            <ButtonSubmit
                            className="group relative w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                            title="Kirim Laporan"
                            progressTitle="Mengirim Laporan..."
                            isProgressing={isSubmitting}
                            />
                        </div>
                    </div>
                </form>
            </div>
        )}
        </div>
    );
};

export default ReportsPage;