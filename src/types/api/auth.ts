import { 
    RegisterSchema,
    LoginSchema,
    VerificationSchema,
    ForgotPasswordEmailVerificationSchema,
    ForgotPasswordResetPasswordSchema
} from "@/app/auth/Schema";
import z from "zod";

export type IRegisterRequest = z.infer<typeof RegisterSchema>;

export type ILoginRequest = z.infer<typeof LoginSchema>;

export interface ILogoutRequest {
    authToken: string;
}

export interface ILogoutResponse {
    message: string;
}

export type IVerificationRequest = z.infer<typeof VerificationSchema>;

export type IForgotPasswordEmailVerificationRequest = z.infer<typeof ForgotPasswordEmailVerificationSchema>;

export interface IForgotPasswordLinkVerificationRequest {
    code: string;
    email: string;
}

export type IForgotPasswordResetPasswordRequest = z.infer<typeof ForgotPasswordResetPasswordSchema>;

export interface IRegisterResponse {
    message: string;
}

export interface ILoginResponse {
    message: string;
    data?: {
        accessToken: string;
        expiresIn: number;
    }
}

export interface IVerificationResponse {
    message: string;
    data?: {
        username: string;
        email: string;
        fullName: string;
    }
}

export interface IForgotPasswordEmailVerificationResponse {
    message: string;
}

export interface IForgotPasswordLinkVerificationResponse {
    message: string;
    data?: {
        email: string;
    }
}

export interface IForgotPasswordResetPasswordResponse {
    message: string;
}