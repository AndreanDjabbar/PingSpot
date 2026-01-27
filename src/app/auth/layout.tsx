import { AuthLayout } from "@/components";

const AuthLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    )
}

export default AuthLayoutWrapper;