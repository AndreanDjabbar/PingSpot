export type IRegisterFormType = {
    fullName: string;
    username: string;
    phone: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    provider?: string;
}

export type ILoginFormType = {
    email: string;
    password: string;
}

export type IVerificationType = {
    code1: string;
    userId: string;
    code2: string;
}

export type IForgotPasswordFormEmailType = {
    email: string;
}

export type IForgotPasswordResetPasswordType = {
    password: string;
    passwordConfirmation: string;
    email?: string;
}

export type ILogoutType = {
    authToken: string;
}