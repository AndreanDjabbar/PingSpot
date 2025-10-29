import { Suspense } from "react";
import VerificationClient from "./VerificationClient";
import { Loading } from "@/components/UI";

const VerificationPage = () => {
    return (
        <Suspense fallback={<Loading size='xl' className='fixed inset-0 left-60'/>}>
        <VerificationClient />
        </Suspense>
    );
}

export default VerificationPage;