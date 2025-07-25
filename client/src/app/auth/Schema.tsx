import z from "zod";

export const RegisterSchema = z.object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
    email: z.email({ message: "Format email tidak valid" }),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    passwordConfirmation: z.string(),
    }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["passwordConfirmation"],
});