/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuNotebookText } from 'react-icons/lu';
import { ButtonSubmit } from '@/components/form';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { Stepper, Button } from '@/components/UI';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useGetReportByID, useReverseCurrentLocation, useEditReport } from '@/hooks/main';
import { useConfirmationModalStore, useFormInformationModalStore, useImagePreviewModalStore } from '@/stores';
import { IEditReportRequest } from '@/types/api/report';
import { IReportImage } from '@/types/model/report';
import { EditReportSchema } from '../../../schema';
import { compressImages, getDataResponseMessage, getErrorResponseDetails, getErrorResponseMessage, getImageURL } from '@/utils';
import { HeaderSection } from '@/app/main/components';
import { ImageItem } from '@/types/global/type';
import { MapStep, DetailStep, AttachmentStep, SummaryStep } from './components';

const EditReportPage = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);
    const customCurrentPath = `/main/reports/${reportId}/Sunting Laporan`;
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const openFormInfo = useFormInformationModalStore((s) => s.openFormInfo);

    const handleOpenInfo = useCallback(() => {
        openFormInfo({
            title: 'Informasi Sunting Laporan',
            type: 'info',
            description: 'Status laporan saat ini tidak mendukung perubahan lokasi. Anda masih dapat memperbarui detail lainnya seperti judul, deskripsi dan lampiran foto.',
        });
    }, [openFormInfo]);
    
    const { data: freshReportData } = useGetReportByID(reportId);
    const freshReport = freshReportData?.data?.report?.report;
    const reportStatus = freshReport?.reportStatus || '';

    const isDisabledStatus = [
        'ON_PROGRESS',
        'POTENTIALLY_RESOLVED',
        'NOT_RESOLVED',
    ].includes((reportStatus || ''));

    const existingImageUrls = React.useMemo(() => {
        const imgs = freshReport?.images as IReportImage | undefined;
        if (!imgs) return [] as string[];
        const keys: (keyof IReportImage)[] = ['image1URL','image2URL','image3URL','image4URL','image5URL'];
        const urls: string[] = [];
        keys.forEach((key) => {
            const image = imgs[key];
            if (image && typeof image === 'string') {
                urls.push(getImageURL(`/report/${image}`, 'main'));
            }
        });
        return urls;
    }, [freshReport]);
    
    const [reportImages, setReportImages] = useState<ImageItem[]>([]);

    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const { 
        mutate: editMutate, 
        isPending: isEditing, 
        isError: editIsError, 
        isSuccess: editIsSuccess, 
        error: editError, 
        data: editData 
    } = useEditReport();
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
    } = useForm<IEditReportRequest>({
        resolver: zodResolver(EditReportSchema),
        defaultValues: {
            hasProgress: false
        }
    });

    useEffect(() => {
        if (!freshReport) return;

        reset({
            reportTitle: freshReport.reportTitle,
            reportDescription: freshReport.reportDescription,
            reportType: freshReport.reportType ? freshReport.reportType.toLowerCase() : undefined,
            location: freshReport.location?.detailLocation || '',
            latitude: freshReport.location?.latitude?.toString() || '',
            longitude: freshReport.location?.longitude?.toString() || '',
            hasProgress: !!freshReport.hasProgress
        } as IEditReportRequest);

        if (freshReport.location && typeof freshReport.location.latitude === 'number' && typeof freshReport.location.longitude === 'number') {
            setMarkerPosition({ lat: freshReport.location.latitude, lng: freshReport.location.longitude });
            setValue('latitude', freshReport.location.latitude.toString());
            setValue('longitude', freshReport.location.longitude.toString());
        }
        setReportImages(existingImageUrls && existingImageUrls.length > 0 ? existingImageUrls.map((url) => ({
            file: null as unknown as File,
            preview: url,
            isExisting: true,
            existingUrl: url
        })) : []);
    }, [freshReport, reset, existingImageUrls]);

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

    const prepareFormData = async(formData: IEditReportRequest): Promise<FormData> => {
        const data = new FormData();
        data.append('reportTitle', formData.reportTitle);
        data.append('reportDescription', formData.reportDescription);
        data.append('reportType', formData.reportType.toUpperCase());
        data.append('detailLocation', formData.location);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude)
        data.append('hasProgress', formData.hasProgress ? 'true' : 'false');

        const getFileNameFromURL = (url: string): string => {
            return url.split("/").filter(Boolean).pop() || "";
        };

        const newImages = reportImages.filter(img => !img.isExisting && img.file);
        const existingImages = reportImages
            .filter(img => img.isExisting && img.existingUrl)
            .map(img => {
                try {
                    const urlParam = new URL(img?.existingUrl || "", window.location.origin).searchParams.get("url");
                    return urlParam ? getFileNameFromURL(decodeURIComponent(urlParam)) : img.existingUrl;
                } catch {
                    return img.existingUrl;
                }
            });

        for (const img of newImages) {
            const compressedFile = await compressImages(img.file);
            data.append('reportImages', compressedFile);
        }

        if (existingImages.length > 0) {
            data.append('existingImages', JSON.stringify(existingImages));
        }

        return data;
    };

    const onSubmit = async(formData: IEditReportRequest) => {
        const preparedData = await prepareFormData(formData);
        handleConfirmationModal(preparedData);
    };

    const handleConfirmationModal = (preparedData: FormData) => {
        openConfirm({
            type: "info",
            title: "Konfirmasi Perbarui Laporan",
            message: "Apakah Anda yakin ingin memperbarui laporan ini?",
            isPending: isEditing || reverseLoading,
            explanation: "Perubahan akan disimpan ke laporan yang sudah ada. Pastikan semua informasi sudah benar sebelum melanjutkan.",
            confirmTitle: "Perbarui",
            cancelTitle: "Batal",
            icon: <LuNotebookText />,
            onConfirm: () => confirmSubmit(preparedData),
        });
    }

    const confirmSubmit = (dataToSubmit: FormData) => {
        if (!dataToSubmit || !markerPosition) return;

        const existingLat = freshReport?.location?.latitude;
        const existingLng = freshReport?.location?.longitude;

        const coordsEqual = (a?: number, b?: number) => {
            if (typeof a !== 'number' || typeof b !== 'number') return false;
            return Math.abs(a - b) < 1e-6;
        };

        if (coordsEqual(existingLat, markerPosition.lat) && coordsEqual(existingLng, markerPosition.lng)) {
            const loc = freshReport?.location;
            if (loc) {
                dataToSubmit.append('displayName', loc.displayName || '');
                dataToSubmit.append('road', loc.road || '');
                dataToSubmit.append('country', loc.country || '');
                dataToSubmit.append('countryCode', loc.countryCode || '');
                dataToSubmit.append('county', loc.county || '');
                dataToSubmit.append('postCode', loc.postCode || '');
                dataToSubmit.append('region', loc.region || '');
                dataToSubmit.append('state', loc.state || '');
                dataToSubmit.append('village', loc.village || '');
                dataToSubmit.append('suburb', loc.suburb || '');
            }

            editMutate({ reportID: reportId, data: dataToSubmit });
            return;
        }

        setFormDataToSubmit(dataToSubmit);
        reverseLocation({
            latitude: markerPosition.lat.toString(),
            longitude: markerPosition.lng.toString()
        });
    }

    useErrorToast(editIsError, editError);
    useSuccessToast(editIsSuccess, editData);

    useEffect(() => {
        if (markerPosition) {
            setValue('latitude', markerPosition.lat.toString());
            setValue('longitude', markerPosition.lng.toString());
        }
    }, [markerPosition, setValue]);

    useEffect(() => {
        if (markerPosition?.lat === freshReport?.location?.latitude && markerPosition?.lng === freshReport?.location?.longitude) {
            if (formDataToSubmit) {
                editMutate({ reportID: reportId, data: formDataToSubmit });
            }
        } else {
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
                
                editMutate({ reportID: reportId, data: formDataToSubmit });
            }
        }
    }, [reverseLocationData, reverseSuccess, formDataToSubmit, editMutate, reportId, markerPosition?.lat, markerPosition?.lng]);

    useEffect(() => {
        if (editIsSuccess) {
            reset();
            setReportImages([]);
            setMarkerPosition(null);
            setFormDataToSubmit(null);
            setCurrentStep(0);
            setTimeout(() => {
                router.push("/main/reports");
            }, 1000);
        }
    }, [editIsSuccess, editData,  router]);

    return (
        <div className="min-h-screen flex flex-col gap-5">
            <HeaderSection 
            currentPath={customCurrentPath}
            message='Laporkan masalah atau kerusakan di sekitar Anda untuk membantu perbaikan lingkungan.'
            />

            {editIsSuccess && (
                <SuccessSection message={getDataResponseMessage(editData) || "Laporan berhasil dikirim!"} />
            )}

            {editIsError && (
                <ErrorSection errors={getErrorResponseDetails(editError)} message={getErrorResponseMessage(editError)}/>
            )}

            <div className='bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8'>
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
                                isDisabledStatus={isDisabledStatus}
                                onOpenInfo={handleOpenInfo}
                            />
                        )}

                        {currentStep === 1 && (
                            <DetailStep
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                reportTypeValue={reportTypeValue}
                                hasProgressValue={hasProgressValue}
                                isDisabledStatus={isDisabledStatus}
                            />
                        )}

                        {currentStep === 2 && (
                            <AttachmentStep
                                images={reportImages}
                                onImageChange={setReportImages}
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
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                            >
                                Kembali
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        if (validateStep(currentStep)) {
                                            setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
                                        }
                                    }}
                                    disabled={!validateStep(currentStep)}
                                >
                                    Lanjut
                                </Button>
                            ) : (
                                <ButtonSubmit
                                    className="px-6 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900 transition-colors duration-300 flex justify-center items-center"
                                    title="Kirim Laporan"
                                    progressTitle={"Menyunting Laporan..."}
                                    isProgressing={isEditing || reverseLoading}
                                />
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReportPage;
