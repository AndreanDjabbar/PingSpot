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

export const LoginSchema = z.object({
    email: z.email({ message: "Format email tidak valid" }),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export const VerificationSchema = z.object({
    code1: z.string().min(1, "Kode verifikasi 1 tidak boleh kosong"),
    userId: z.string().min(1, "ID pengguna tidak boleh kosong"),
    code2: z.string().min(1, "Kode verifikasi 2 tidak boleh kosong"),
})

export const ForgotPasswordEmailVerificationSchema = z.object({
    email: z.email({ message: "Format email tidak valid" }),
});