/* eslint-disable react-hooks/rules-of-hooks */
import "./globals.css";
import { 
  ConfirmationModalProvider, 
  ReactQueryClientProvider 
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
      <body className="antialiased" style={{ fontFamily: "var(--font-sf)" }}>
        <ReactQueryClientProvider>
          <ToastContainer />
            <ClientLayout>
              {children}
              <ConfirmationModalProvider />
            </ClientLayout>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;