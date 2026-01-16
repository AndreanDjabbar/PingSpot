import { MultipleImageField, TextAreaField } from '@/components/form';
import React from 'react';
import { BiMessageDetail } from 'react-icons/bi';
import { FaCamera } from 'react-icons/fa';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ImageItem } from '@/types/global/type';
import { IUploadProgressReportRequest } from '@/types/api/report';

interface DetailSectionProps {
    register: UseFormRegister<IUploadProgressReportRequest>;
    errors?: FieldErrors<IUploadProgressReportRequest>;
    images: ImageItem[];
    onImagesChange: (files: ImageItem[]) => void;
    onImageClick?: (imageUrl: string) => void;
}

const DetailSection: React.FC<DetailSectionProps> = ({
    register,
    errors,
    images,
    onImagesChange,
    onImageClick
}) => {
    return (
        <div className="space-y-5">
            <div>
                <TextAreaField
                    id="progressNotes"
                    register={register("progressNotes")}
                    rows={5}
                    className="w-full"
                    withLabel={true}
                    labelTitle="Catatan Progress"
                    labelIcon={<BiMessageDetail size={20} />}
                    placeHolder="Jelaskan detail progress dari laporan ini. Misalnya: perbaikan sudah dimulai, material sudah disiapkan, dll."
                />
                {errors?.progressNotes && (
                    <p className="text-red-500 text-sm font-semibold mt-2">
                        {errors.progressNotes.message as string}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <FaCamera className="w-5 h-5 text-gray-700" />
                    <label className="text-sm font-bold text-gray-900">
                        Lampiran Foto (Opsional, Maksimal 2)
                    </label>
                </div>
                <MultipleImageField
                    id="progressImages"
                    withLabel={false}
                    buttonTitle="Pilih Foto Progress"
                    width={150}
                    height={150}
                    shape="square"
                    maxImages={2}
                    images={images}
                    onChange={onImagesChange}
                    onImageClick={onImageClick}
                />
                <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    💡 Tips: Tambahkan foto untuk memperjelas perkembangan laporan dan meningkatkan kepercayaan komunitas
                </p>
            </div>
        </div>
    );
};

export default DetailSection;