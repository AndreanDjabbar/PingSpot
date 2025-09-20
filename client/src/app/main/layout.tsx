import { MainLayout } from "@/components/layouts";

const MainLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}

export default MainLayoutWrapper;