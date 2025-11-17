import React from 'react';
import { MultipleImageField } from '@/components/form';
import { ImageItem } from '@/types/global/type';

interface AttachmentStepProps {
    images: ImageItem[];
    onImageChange: (items: ImageItem[]) => void;
    onImageClick: (imageUrl: string) => void;
}

const AttachmentStep: React.FC<AttachmentStepProps> = ({ 
    images,
    onImageChange, 
    onImageClick 
}) => {
    return (
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
                                height={200}
                                shape="square"
                                maxImages={5}
                                images={images}
                                onChange={(items) => onImageChange(items.slice(0, 5))}
                                onImageClick={onImageClick}
                            />
                        </div>
                        <p className="text-sm text-center text-gray-500 mt-1">
                            Unggah foto untuk membantu identifikasi masalah (opsional)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttachmentStep;
