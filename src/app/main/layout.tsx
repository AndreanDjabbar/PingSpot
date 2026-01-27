import { MainLayout } from "@/components";

const MainLayoutWrapper = ({children}: {children: React.ReactNode}) => {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}

export default MainLayoutWrapper;