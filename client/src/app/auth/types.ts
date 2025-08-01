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