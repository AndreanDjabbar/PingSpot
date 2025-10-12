"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField, ButtonSubmit, TextAreaField, RadioField, MultipleImageField } from '@/components/form';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import { IoLocationOutline } from 'react-icons/io5';
import { LuNotebookText } from "react-icons/lu";
import { SuccessSection, ErrorSection, ImagePreviewModal } from '@/components/feedback';
import { getErrorResponseDetails, getErrorResponseMessage, getDataResponseMessage } from '@/utils';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useCreateReport, useReverseCurrentLocation } from '@/hooks/main';
import { CreateReportSchema } from '../../schema';
import { ICreateReportRequest } from '@/types/api/report';
import HeaderSection from '../../components/HeaderSection';
import { useConfirmationModalStore } from '@/stores';

const DynamicMap = dynamic(() => import('../../components/DynamicMap'), {
    ssr: false,
});

const ReportsPage = () => {
    const currentPath = usePathname();
    const [reportImages, setReportImages] = useState<File[]>([]);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    const { mutate, isPending, isError, isSuccess, error, data } = useCreateReport();
    const { 
        mutate: reverseLocation, 
        data: reverseLocationData, 
        isPending: reverseLoading,
        isSuccess: reverseSuccess, 
    } = useReverseCurrentLocation();
    const { openConfirm } = useConfirmationModalStore();
    
    const issueTypes = [
        { value: 'infrastructure', label: 'Infrastruktur' },
        { value: 'environment', label: 'Lingkungan' },
        { value: 'safety', label: 'Keamanan' },
        { value: 'other', label: 'Lainnya' }
    ];

    const handleImageClick = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch
    } = useForm<ICreateReportRequest>({
        resolver: zodResolver(CreateReportSchema),
    });

    const reportTypeValue = watch('reportType');

    const confirmSubmit = (dataToSubmit: FormData) => {
        if (dataToSubmit && markerPosition) {
            setFormDataToSubmit(dataToSubmit);
            reverseLocation({
                latitude: markerPosition.lat.toString(),
                longitude: markerPosition.lng.toString()
            });
        }
    }

    useEffect(() => {
        if (markerPosition) {
            setValue('latitude', markerPosition.lat.toString());
            setValue('longitude', markerPosition.lng.toString());
        }
    }, [markerPosition, setValue]);

    useEffect(() => {
        if (reverseLocationData && formDataToSubmit) {
            const {
                country, 
                country_code, 
                county, 
                postcode, 
                region, 
                road,
                state, 
                village, 
                suburb
            } = reverseLocationData.address || {};
            
            formDataToSubmit.append('displayName', reverseLocationData.display_name || '');
            formDataToSubmit.append('road', road || '');
            formDataToSubmit.append('country', country || '');
            formDataToSubmit.append('countryCode', country_code || '');
            formDataToSubmit.append('county', county || '');
            formDataToSubmit.append('postCode', postcode || '');
            formDataToSubmit.append('region', region || '');
            formDataToSubmit.append('state', state || '');
            formDataToSubmit.append('village', village || '');
            formDataToSubmit.append('suburb', suburb || '');
            mutate(formDataToSubmit);
        }
    }, [reverseLocationData, reverseSuccess, formDataToSubmit, mutate]);

    useEffect(() => {
        if (isSuccess) {
            reset();
            setReportImages([]);
            setMarkerPosition(null);
            setFormDataToSubmit(null);
        }
    }, [isSuccess, data, reset]);

    const prepareFormData = (formData: ICreateReportRequest): FormData => {
        const data = new FormData();
        data.append('reportTitle', formData.reportTitle);
        data.append('reportDescription', formData.reportDescription);
        data.append('reportType', formData.reportType.toUpperCase());
        data.append('detailLocation', formData.location);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        if (reportImages && reportImages.length > 0 ) {
            reportImages.forEach((file) => {
                data.append('reportImages', file);
            });
        }
        return data;
    }

    const onSubmit = (formData: ICreateReportRequest) => {
        const preparedData = prepareFormData(formData);
        handleConfirmationModal(preparedData);
    };

    const handleConfirmationModal = (preparedData: FormData) => {
        openConfirm({
            type: "info",
            title: "Konfirmasi Pembuatan Laporan",
            message: "Apakah Anda yakin ingin membuat laporan ?",
            isPending: isPending || reverseLoading,
            explanation: "Anda akan membuat laporan baru. Pastikan semua informasi sudah benar sebelum melanjutkan.",
            confirmTitle: "Buat",
            cancelTitle: "Batal",
            icon: <LuNotebookText />,
            onConfirm: () => confirmSubmit(preparedData),
        });
    }

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

    return (
        <div className="space-y-8">
        <HeaderSection 
            currentPath={currentPath}
            message="Laporkan masalah atau kerusakan di sekitar Anda untuk membantu perbaikan lingkungan."
        />

        {isSuccess && (
            <SuccessSection message={getDataResponseMessage(data) || "Laporan berhasil dikirim!"} />
        )}

        {isError && (
            <ErrorSection 
            message={getErrorResponseMessage(error)} 
            errors={getErrorResponseDetails(error)} 
            />
        )}

        {!isSuccess && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-8 w-full" encType="multipart/form-data">
                    <div className="w-full flex flex-col gap-6">
                        <div>

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
                            <div className="text-red-500 text-sm font-semibold">{errors?.latitude?.message as string || errors?.longitude?.message as string}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="w-full">
                                <InputField
                                    id="title"
                                    register={register("reportTitle")}
                                    type="text"
                                    className="w-full"
                                    withLabel={true}
                                    labelTitle="Judul Laporan"
                                    icon={<LuNotebookText size={20} />}
                                    placeHolder="Masukkan judul laporan"
                                />
                                <div className="text-red-500 text-sm font-semibold">{errors.reportTitle?.message as string}</div>
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
                            register={register("reportDescription")}
                            rows={4}
                            className="w-full"
                            withLabel={true}
                            labelTitle="Deskripsi Permasalahan"
                            placeHolder="Jelaskan permasalahan dengan detail"
                            />
                            <div className="text-red-500 text-sm font-semibold">{errors.reportDescription?.message as string}</div>
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
                                <MultipleImageField
                                id="reportImages"
                                withLabel={true}
                                labelTitle="Foto Permasalahan (Maks. 5 Foto)"
                                buttonTitle="Pilih Foto"
                                width={200}
                                height={200}
                                shape="square"
                                maxImages={5}
                                onChange={(files) => setReportImages(files)}
                                onImageClick={handleImageClick}
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
                            isProgressing={isPending || reverseLoading}
                            />
                        </div>
                    </div>
                </form>
            </div>
        )}
        <ImagePreviewModal
            imageUrl={previewImage}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
        />
        </div>
    );
};

export default ReportsPage;