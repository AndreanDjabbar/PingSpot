import AuthLayout from "@/layouts/AuthLayout";

const AuthLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    )
}

export default AuthLayoutWrapper;