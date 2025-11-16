"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonSubmit } from '@/components/form';
import { SuccessSection, ErrorSection } from '@/components/feedback';
import { getErrorResponseDetails, getErrorResponseMessage, getDataResponseMessage } from '@/utils';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useCreateReport, useReverseCurrentLocation } from '@/hooks/main';
import { CreateReportSchema } from '../../schema';
import { ICreateReportRequest } from '@/types/api/report';
import HeaderSection from '../../components/HeaderSection';
import { useConfirmationModalStore, useImagePreviewModalStore } from '@/stores';
import { LuNotebookText } from "react-icons/lu";
import { Stepper } from '@/components/UI';
import { AttachmentStep, DetailStep, MapStep, SummaryStep } from './components';
import { ImageItem } from '@/types/global/type';

const CreateReportPage = () => {
    const currentPath = usePathname();
    const router = useRouter();

    const [reportImages, setReportImages] = useState<ImageItem[]>([]);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const { mutate, isPending, isError, isSuccess, error, data } = useCreateReport();
    const { 
        mutate: reverseLocation, 
        data: reverseLocationData, 
        isPending: reverseLoading,
        isSuccess: reverseSuccess, 
    } = useReverseCurrentLocation();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        watch
    } = useForm<ICreateReportRequest>({
        resolver: zodResolver(CreateReportSchema),
        defaultValues: {
            hasProgress: false
        }
    });

    const reportTypeValue = watch('reportType');
    const hasProgressValue = watch('hasProgress');

    const steps = [
        { label: 'Lokasi', description: 'Pilih lokasi masalah' },
        { label: 'Detail', description: 'Isi informasi laporan' },
        { label: 'Lampiran', description: 'Isi lampiran terkait laporan' },
        { label: 'Konfirmasi', description: 'Tinjau & kirim' }
    ];

    const handleImageClick = (imageUrl: string) => {
        openImagePreview(imageUrl);
    };

    const validateStep = (stepIndex: number): boolean => {
        if (stepIndex === 0) {
            return !!markerPosition?.lat && !!markerPosition?.lng;
        }
        if (stepIndex === 1) {
            const title = watch('reportTitle');
            const description = watch('reportDescription');
            const type = watch('reportType');
            const location = watch('location');
            return !!(title && description && type && location);
        }
        return true;
    };

    const prepareFormData = (formData: ICreateReportRequest): FormData => {
        const data = new FormData();
        data.append('reportTitle', formData.reportTitle);
        data.append('reportDescription', formData.reportDescription);
        data.append('reportType', formData.reportType.toUpperCase());
        data.append('detailLocation', formData.location);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        data.append('hasProgress', formData.hasProgress ? 'true' : 'false');
        if (reportImages && reportImages.length > 0 ) {
            reportImages.forEach((file) => {
                data.append('reportImages', file.file);
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

    const confirmSubmit = (dataToSubmit: FormData) => {
        if (dataToSubmit && markerPosition) {
            setFormDataToSubmit(dataToSubmit);
            reverseLocation({
                latitude: markerPosition.lat.toString(),
                longitude: markerPosition.lng.toString()
            });
        }
    }

    useErrorToast(isError, error);
    useSuccessToast(isSuccess, data);

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
            setCurrentStep(0);
            setTimeout(() => {
                router.push("/main/reports");
            }, 1000);
        }
    }, [isSuccess, data, reset, router]);

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
                <div className="mb-8">
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        onStepChange={setCurrentStep}
                        validateStep={validateStep}
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center p-5 space-y-8 w-full" encType="multipart/form-data">
                    <input type="hidden" {...register('latitude')} />
                    <input type="hidden" {...register('longitude')} />

                    <div className="w-full flex flex-col gap-6">
                        {currentStep === 0 && (
                            <MapStep
                                onMarkerPositionChange={setMarkerPosition}
                                markerPosition={markerPosition}
                                latitudeError={errors?.latitude?.message as string}
                                longitudeError={errors?.longitude?.message as string}
                            />
                        )}

                        {currentStep === 1 && (
                            <DetailStep
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                reportTypeValue={reportTypeValue}
                                hasProgressValue={hasProgressValue}
                            />
                        )}

                        {currentStep === 2 && (
                            <AttachmentStep
                                onImageChange={setReportImages}
                                images={reportImages}
                                onImageClick={handleImageClick}
                            />
                        )}

                        {currentStep === 3 && (
                            <SummaryStep
                                watch={watch}
                                reportImagesCount={reportImages.length}
                            />
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Kembali
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (validateStep(currentStep)) {
                                            setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
                                        }
                                    }}
                                    disabled={!validateStep(currentStep)}
                                    className="px-6 py-2.5 rounded-lg bg-sky-700 text-white font-medium hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Lanjut
                                </button>
                            ) : (
                                <ButtonSubmit
                                    className="px-6 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900 transition-colors duration-300 flex justify-center items-center"
                                    title="Kirim Laporan"
                                    progressTitle="Mengirim Laporan..."
                                    isProgressing={isPending || reverseLoading}
                                />
                            )}
                        </div>
                    </div>
                </form>
            </div>
        )}
        </div>
    );
};

export default CreateReportPage;