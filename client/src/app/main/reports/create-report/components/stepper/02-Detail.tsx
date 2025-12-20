import React, { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { InputField, TextAreaField, SelectField, CheckboxField } from '@/components/form';
import { LuNotebookText } from "react-icons/lu";
import { IoLocationOutline } from 'react-icons/io5';
import { BiCategory } from 'react-icons/bi';
import { ICreateReportRequest } from '@/types/api/report';

interface DetailStepProps {
    register: UseFormRegister<ICreateReportRequest>;
    setValue: UseFormSetValue<ICreateReportRequest>;
    errors: FieldErrors<ICreateReportRequest>;
    reportTypeValue?: string;
    hasProgressValue?: boolean;
}

const DetailStep: React.FC<DetailStepProps> = ({ 
    register, 
    setValue, 
    errors, 
    reportTypeValue, 
    hasProgressValue 
}) => {
    useEffect(() => {
        const titleInput = document.getElementById('title');
        if (titleInput) {
            titleInput.focus();
        }
    }, []);
    
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

    return (
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
                    <div className="text-red-500 text-sm font-semibold">
                        {errors.reportTitle?.message as string}
                    </div>
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
                    <div className="text-red-500 text-sm font-semibold">
                        {errors.location?.message as string}
                    </div>
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
                <div className="text-red-500 text-sm font-semibold">
                    {errors.reportDescription?.message as string}
                </div>
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
    );
};

export default DetailStep;
