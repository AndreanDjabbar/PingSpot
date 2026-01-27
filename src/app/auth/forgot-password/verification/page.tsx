import { Suspense } from "react";
import VerificationClient from "./VerificationClient";
import { Loading } from "@/components";

const VerificationPage = () => {
    return (
        <Suspense fallback={<Loading size='xl' className='fixed inset-0 left-0 xl:left-60'/>}>
        <VerificationClient />
        </Suspense>
    );
}

export default VerificationPage;