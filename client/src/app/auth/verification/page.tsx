import VerificationClient from "./VerificationClient";
import { Suspense } from "react";

const VerificationPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerificationClient />
        </Suspense>
    );
}

export default VerificationPage;