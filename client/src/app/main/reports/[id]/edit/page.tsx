/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { FaCheck, FaTimes, FaCamera, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { BiCategory, BiMessageDetail } from 'react-icons/bi';
import { LuNotebookText } from 'react-icons/lu';
import { RiProgress3Fill } from 'react-icons/ri';
import { ButtonSubmit, CheckboxField, InputField, MultipleImageField, SelectField, TextAreaField } from '@/components/form';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { Breadcrumb } from '@/components/layouts';
import { Accordion, Guide, Stepper } from '@/components/UI';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useGetReportByID, useReverseCurrentLocation, useUpdateReport } from '@/hooks/main';
import { useConfirmationModalStore, useImagePreviewModalStore } from '@/stores';
import { IUpdateReportRequest } from '@/types/api/report';
import { IReportImage } from '@/types/model/report';
import { CreateReportSchema, UploadProgressReportSchema } from '../../../schema';
import { getErrorResponseDetails, getErrorResponseMessage, getImageURL } from '@/utils';
import { IoLocationOutline } from 'react-icons/io5';
import { DynamicMap } from '@/app/main/components';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { MdOutlineNoteAlt, MdTrackChanges } from 'react-icons/md';
import { IoMdImages } from 'react-icons/io';

const EditReportPage = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);
    const customCurrentPath = `/main/reports/${reportId}/Sunting Laporan`;
    const [reportImages, setReportImages] = useState<File[]>([]);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    
    const { data: freshReportData } = useGetReportByID(reportId);
    const freshReport = freshReportData?.data?.report?.report;

    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const { 
        mutate: updateMutate, 
        isPending: isUpdating, 
        isError: updateIsError, 
        isSuccess: updateIsSuccess, 
        error: updateError, 
        data: updateData 
    } = useUpdateReport();
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
    } = useForm<IUpdateReportRequest>({
        resolver: zodResolver(CreateReportSchema),
        defaultValues: {
            hasProgress: false
        }
    });

    // Prefill form when we have the report data
    useEffect(() => {
        if (!freshReport) return;

        // map API values to form fields
        reset({
            reportTitle: freshReport.reportTitle,
            reportDescription: freshReport.reportDescription,
            reportType: freshReport.reportType ? freshReport.reportType.toLowerCase() : undefined,
            location: freshReport.location?.detailLocation || '',
            latitude: freshReport.location?.latitude?.toString() || '',
            longitude: freshReport.location?.longitude?.toString() || '',
            hasProgress: !!freshReport.hasProgress
        } as IUpdateReportRequest);

        if (freshReport.location && typeof freshReport.location.latitude === 'number' && typeof freshReport.location.longitude === 'number') {
            setMarkerPosition({ lat: freshReport.location.latitude, lng: freshReport.location.longitude });
            setValue('latitude', freshReport.location.latitude.toString());
            setValue('longitude', freshReport.location.longitude.toString());
        }

        // If the report contains images, we don't convert them to File objects here — MultipleImageField will accept new uploads only.
        setReportImages([]);
    }, [freshReport, reset, setValue]);

    const reportTypeValue = watch('reportType');
    const hasProgressValue = watch('hasProgress');
    
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

    const steps = [
        { label: 'Lokasi', description: 'Pilih lokasi masalah' },
        { label: 'Detail', description: 'Isi informasi laporan' },
        { label: 'Lampiran', description: 'Isi lampiran terkait laporan' },
        { label: 'Konfirmasi', description: 'Tinjau & kirim' }
    ];

    const handleImageClick = (imageUrl: string) => {
        openImagePreview(imageUrl);
    };

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

    const prepareFormData = (formData: IUpdateReportRequest): FormData => {
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
                data.append('reportImages', file);
            });
        }
        return data;
    }

    const onSubmit = (formData: IUpdateReportRequest) => {
        const preparedData = prepareFormData(formData);
        handleConfirmationModal(preparedData);
    };

    const handleConfirmationModal = (preparedData: FormData) => {
        openConfirm({
            type: "info",
            title: "Konfirmasi Perbarui Laporan",
            message: "Apakah Anda yakin ingin memperbarui laporan ini?",
            isPending: isUpdating || reverseLoading,
            explanation: "Perubahan akan disimpan ke laporan yang sudah ada. Pastikan semua informasi sudah benar sebelum melanjutkan.",
            confirmTitle: "Perbarui",
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

    useErrorToast(updateIsError, updateError);
    useSuccessToast(updateIsSuccess, updateData);

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
            
            updateMutate({ reportID: reportId, data: formDataToSubmit });
        }
    }, [reverseLocationData, reverseSuccess, formDataToSubmit, updateMutate, reportId]);

    useEffect(() => {
        if (updateIsSuccess) {
            reset();
            setReportImages([]);
            setMarkerPosition(null);
            setFormDataToSubmit(null);
            setCurrentStep(0);
            setTimeout(() => {
                router.push("/main/reports");
            }, 1000);
        }
    }, [updateIsSuccess, updateData, reset, router]);

    return (
        <div className="min-h-screen flex flex-col gap-5">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className='flex flex-col gap-3'>
                        <Breadcrumb path={customCurrentPath}/>
                        <p className="text-gray-600 text-sm">
                            Perbarui status perkembangan laporan Anda untuk memberi informasi terkini kepada komunitas.
                        </p>
                    </div>
                </div>
            </div>

            {updateIsError && (
                <ErrorSection errors={getErrorResponseDetails(updateError)} message={getErrorResponseMessage(updateError)}/>
            )}

            <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6'>
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
                            <div>
                                <div className="w-full bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-gray-700" />
                                        Pilih Lokasi
                                    </h2>
                                    <p className="text-gray-600 mb-4 text-sm">Klik  pada peta untuk menentukan lokasi masalah atau aktifkan lokasi otomatis</p>
                                    <div className="h-[400px] w-full mb-4">
                                        <DynamicMap onMarkerPositionChange={setMarkerPosition}/>
                                    </div>
                                </div>
                                <div className="text-red-500 text-sm font-semibold">{errors?.latitude?.message as string || errors?.longitude?.message as string}</div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="w-full">
                                        <InputField
                                            id="title"
                                            register={register("reportTitle")}
                                            type="text"
                                            className="w-full"
                                            withLabel={true}
                                            required
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
                                            required
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
                                        required
                                        className="w-full"
                                        withLabel={true}
                                        labelTitle="Deskripsi Permasalahan"
                                        placeHolder="Jelaskan permasalahan dengan detail"
                                    />
                                    <div className="text-red-500 text-sm font-semibold">{errors.reportDescription?.message as string}</div>
                                </div>

                                <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                                    <div className="w-full md:w-1/2">
                                        <SelectField
                                            id="reportType"
                                            name="reportType"
                                            value={reportTypeValue || ''}
                                            register={register("reportType")}
                                            onChange={(value) => setValue('reportType', value as 'infrastructure' | 'environment' | 'safety' | 'other')}
                                            withLabel={true}
                                            labelTitle="Jenis Laporan"
                                            options={issueTypes}
                                            placeholder="Pilih jenis laporan"
                                            required={true}
                                            icon={<BiCategory size={20} />}
                                            error={errors.reportType?.message as string}
                                        />
                                    </div>

                                    <div className="w-full md:w-1/2">
                                        <CheckboxField
                                            id="hasProgress"
                                            name="hasProgress"
                                            values={hasProgressValue ? ['enable'] : []}
                                            onChange={(values) => setValue('hasProgress', values.includes('enable'))}
                                            withLabel={true}
                                            labelTitle="Fitur Progress Laporan" 
                                            options={[
                                                { value: 'enable', label: 'Aktifkan progress laporan' }
                                            ]}
                                            informationTitle="Fitur Progress Laporan"
                                            informationDescription="Dengan mengaktifkan fitur progress, Anda dapat melacak dan mendokumentasikan perkembangan penanganan laporan secara berkala. Setiap tahapan perbaikan atau tindak lanjut dapat Anda catat dengan menambahkan update progress beserta foto pendukung."
                                            informationAdditionalInfo="Fitur ini sangat berguna untuk laporan yang memerlukan penanganan bertahap atau jangka panjang, sehingga Anda dan pihak terkait dapat memantau kemajuan perbaikan secara transparan dan terstruktur."
                                            layout="vertical"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <div className="w-full">
                                    <div className='flex flex-col justify-center items-center gap-6'>
                                        <label htmlFor="reportImages" className="text-md font-semibold text-gray-900 items-center">
                                            Foto Permasalahan (Maks. 5 Foto)
                                        </label>
                                        <div>
                                            <div className=''>
                                                <MultipleImageField
                                                    id="reportImages"
                                                    withLabel={false}
                                                    buttonTitle="Pilih Foto"
                                                    width={200}
                                                    existingImages={existingImageUrls}
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border-l-4 border-amber-400">
                                    <div className="flex items-center gap-3">
                                        <div className="">
                                            <BsFillInfoCircleFill className	="w-5 h-5 text-amber-600" />
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
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul Laporan</label>
                                                        <p className="text-base text-gray-900 mt-1 font-medium">{watch('reportTitle') || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis Laporan</label>
                                                        <p className="text-base text-gray-900 mt-2">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                                {issueTypes.find(t => t.value === watch('reportType'))?.label || '-'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fitur Progress</label>
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
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail Lokasi</label>
                                                    <p className="text-base text-gray-900 mt-1">{watch('location') || '-'}</p>
                                                </div>
                                            </Accordion.Item>

                                            <Accordion.Item
                                                id="description"
                                                title="Deskripsi Permasalahan"
                                                icon={<MdOutlineNoteAlt className="w-5 h-5 text-gray-700" />}
                                            >
                                                <div>
                                                    <p className="text-base text-gray-700 leading-relaxed">{watch('reportDescription') || '-'}</p>
                                                </div>
                                            </Accordion.Item>

                                            <Accordion.Item
                                                id="attachment"
                                                title="Lampiran Foto"
                                                icon={<IoMdImages className	="w-5 h-5 text-gray-700" />}
                                            >
                                                <div>
                                                    {reportImages.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base text-gray-900 font-medium">
                                                                {reportImages.length} foto dilampirkan
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-base text-gray-500 italic">Tidak ada foto yang dilampirkan</p>
                                                    )}
                                                </div>
                                            </Accordion.Item>
                                        </Accordion>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
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
                                    isProgressing={isUpdating || reverseLoading}
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
