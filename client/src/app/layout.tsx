/* eslint-disable react-hooks/rules-of-hooks */
import "./globals.css";
import { 
  ConfirmationModalProvider, 
  ImagePreviewModalProvider, 
  ReactQueryClientProvider,
  FormInformationModalProvider
} from "@/provider";
import { ToastContainer } from "react-toastify";
import ClientLayout from "./client-layout";

export const metadata = {
  title: 'PingSpot',
  icons: {
    icon: '/favicon.png'
  }
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-gray-50 to-gray-100" style={{ fontFamily: "var(--font-sf)" }}>
        <ReactQueryClientProvider>
          <ToastContainer />
            <ClientLayout>
              {children}
              <ConfirmationModalProvider />
              <ImagePreviewModalProvider />
              <FormInformationModalProvider />
            </ClientLayout>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;