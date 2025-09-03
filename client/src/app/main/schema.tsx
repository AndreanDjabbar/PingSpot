
import z from "zod";

export const SaveProfileSchema = z.object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    gender: z.enum(["male", "female"], {
        message: "Jenis kelamin harus diantara laki-laki atau perempuan"
    }).optional().nullable(),
    bio: z.string().max(200, "Bio maksimal 200 karakter").optional(),
    dob: z.string().refine((date) => {
        if (!date || date.trim() === "") return true;
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return false;
        
        const minDate = new Date("1905-01-01");
        const maxDate = new Date("2023-12-31");
        return parsedDate >= minDate && parsedDate <= maxDate;
    }, { message: "Tanggal lahir tidak valid" }).optional().nullable(),
    profilePicture: z.file().min(1).max(5 * 1024 * 1024).optional()
})