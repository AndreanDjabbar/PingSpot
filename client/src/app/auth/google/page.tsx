import GoogleAuthClient from "./GoogleClient";
import { Suspense } from "react";

const GoogleAuthPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GoogleAuthClient />
        </Suspense>
    );
}

export default GoogleAuthPage;