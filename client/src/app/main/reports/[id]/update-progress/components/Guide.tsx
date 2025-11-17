import { Guide } from '@/components/UI'
import React from 'react'
import { LuNotebookText } from 'react-icons/lu'

const GuideSection = () => {
    return (
        <div>
            <Guide
                title="Panduan Memperbarui"
                subtitle="Ikuti langkah berikut untuk memperbarui progress laporan"
                icon={<LuNotebookText size={20}/>}
                steps={[
                    {
                        number: 1,
                        title: "Pilih Status Progress",
                        description: "Tentukan apakah laporan sudah terselesaikan, dalam proses, atau belum ada perkembangan"
                    },
                    {
                        number: 2,
                        title: "Tulis Catatan Detail",
                        description: "Jelaskan perkembangan laporan secara detail (minimal 5 karakter)"
                    },
                    {
                        number: 3,
                        title: "Tambahkan Foto",
                        description: "Upload foto pendukung (opsional, maksimal 2 foto)"
                    },
                    {
                        number: 4,
                        title: "Konfirmasi Update",
                        description: "Klik tombol untuk menyimpan perubahan progress laporan"
                    }
                ]}
                alerts={[
                    {
                        type: 'warning',
                        emoji: '⚠️',
                        title: 'Penting!',
                        message: 'Jika laporan ditutup (status: Terselesaikan), Anda tidak bisa membuka atau memperbarui progress lagi.'
                    },
                    {
                        type: 'success',
                        emoji: '💡',
                        title: 'Tips',
                        message: 'Berikan informasi yang jelas dan transparan agar komunitas dapat memantau perkembangan laporan dengan baik.'
                    }
                ]}
            />
        </div>
    )
}

export default GuideSection