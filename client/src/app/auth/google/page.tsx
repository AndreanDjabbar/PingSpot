import { Loading } from "@/components/UI";
import GoogleAuthClient from "./GoogleClient";
import { Suspense } from "react";

const GoogleAuthPage = () => {
    return (
        <Suspense fallback={<Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>}>
            <GoogleAuthClient />
        </Suspense>
    );
}

export default GoogleAuthPage;