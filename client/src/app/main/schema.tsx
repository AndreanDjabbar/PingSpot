
import z from "zod";

export const SaveProfileSchema = z.object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    gender: z.enum(["male", "female"], {
        message: "Jenis kelamin harus diantara laki-laki atau perempuan"
    }).optional().nullable(),
    bio: z.string().max(200, "Bio maksimal 200 karakter").optional(),
    birthday: z.string().refine((date) => {
        if (!date || date.trim() === "") return true;
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return false;
        
        const minDate = new Date("1905-01-01");
        const maxDate = new Date("2023-12-31");
        return parsedDate >= minDate && parsedDate <= maxDate;
    }, { message: "Tanggal lahir tidak valid" }).optional().nullable(),
    profilePicture: z.file().min(1).max(5 * 1024 * 1024).optional()
})

export const SaveSecuritySchema = z.object({
    currentPassword: z.string().min(6, "Kata sandi lama minimal 6 karakter"),
    currentPasswordConfirmation: z.string().min(6, "Konfirmasi kata sandi lama minimal 6 karakter"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    newPasswordConfirmation: z.string().min(6, "Konfirmasi kata sandi baru minimal 6 karakter"),
}).refine((data) => data.currentPassword === data.currentPasswordConfirmation, {
    message: "Konfirmasi kata sandi lama tidak sesuai",
    path: ["oldPasswordConfirmation"],
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Konfirmasi kata sandi baru tidak sesuai",
    path: ["newPasswordConfirmation"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "Kata sandi baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
});

export const CreateReportSchema = z.object({
    reportTitle: z.string().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
    reportDescription: z.string().min(10, "Deskripsi minimal 10 karakter").max(500, "Deskripsi maksimal 500 karakter"),
    reportType: z.enum([
        'infrastructure', 
        'environment', 
        'safety',
        'traffic',
        'public_facility',
        'waste',
        'water',
        'electricity',
        'health',
        'social',
        'education',
        'administrative',
        'disaster',
        'other'
    ], {
        message: "Pilih salah satu jenis laporan"
    }),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    latitude: z.string().min(1, "Pilih lokasi pada peta").refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: "Koordinat latitude tidak valid" }
    ),
    longitude: z.string().min(1, "Pilih lokasi pada peta").refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: "Koordinat longitude tidak valid" }
    ),
    mapZoom: z.string().optional(),
    hasProgress: z.boolean().optional(),
    reportImages: z
    .array(z.instanceof(File))
    .max(5, "Maksimal 5 gambar")
    .refine(
    (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
    "Setiap gambar maksimal 5MB"
    ).optional(),
});

export const EditReportSchema = z.object({
    reportTitle: z.string().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
    reportDescription: z.string().min(10, "Deskripsi minimal 10 karakter").max(500, "Deskripsi maksimal 500 karakter"),
    reportType: z.enum([
        'infrastructure', 
        'environment', 
        'safety',
        'traffic',
        'public_facility',
        'waste',
        'water',
        'electricity',
        'health',
        'social',
        'education',
        'administrative',
        'disaster',
        'other'
    ], {
        message: "Pilih salah satu jenis laporan"
    }),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    latitude: z.string().min(1, "Pilih lokasi pada peta").refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: "Koordinat latitude tidak valid" }
    ),
    longitude: z.string().min(1, "Pilih lokasi pada peta").refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: "Koordinat longitude tidak valid" }
    ),
    hasProgress: z.boolean().optional(),
});

export const ReactReportSchema = z.object({
    reactionType: z.enum(['LIKE', 'DISLIKE'], {
        message: "Tipe reaksi harus LIKE atau DISLIKE"
    })
});

export const VoteReportSchema = z.object({
    voteType: z.enum(['RESOLVED', 'ON_PROGRESS', 'NOT_RESOLVED'], {
        message: "Tipe vote harus RESOLVED atau NOT_RESOLVED"
    })
});

export const UploadProgressReportSchema = z.object({
    progressStatus: z.enum(['RESOLVED', 'ON_PROGRESS', 'NOT_RESOLVED'], {
        message: "Status progres harus RESOLVED, ON_PROGRESS, atau NOT_RESOLVED"
    }),
    progressNotes: z.string().min(5, "Catatan minimal 5 karakter").max(300, "Catatan maksimal 300 karakter"),
    progressAttachments: z
    .array(z.instanceof(File))
    .max(2, "Maksimal 2 gambar")
    .refine(
    (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
    "Setiap gambar maksimal 5MB"
    ).optional(),
})

export const CreateReportCommentSchema = z.object({
    commentContent: z.string()
        .min(1, "Komentar tidak boleh kosong")
        .max(500, "Komentar maksimal 500 karakter"),
    parentCommentID: z.string().optional().nullable(),
    mediaType: z.enum(['IMAGE', 'GIF']).optional().nullable(),
    mediaURL: z.string().optional().nullable(),
    mediaFile: z.file().min(1).max(5 * 1024 * 1024).optional()
});
