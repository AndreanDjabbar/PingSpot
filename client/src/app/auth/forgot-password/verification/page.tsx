import { Suspense } from "react";
import VerificationClient from "./VerificationClient";

const VerificationPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <VerificationClient />
        </Suspense>
    );
}

export default VerificationPage;