import { Suspense } from "react";
import VerificationClient from "./VerificationClient";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <VerificationClient />
        </Suspense>
    );
}
