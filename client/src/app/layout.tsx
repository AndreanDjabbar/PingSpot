/* eslint-disable react-hooks/rules-of-hooks */
import "./globals.css";
import { ReactQueryClientProvider } from "@/provider/react-query-client";
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
            </ClientLayout>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;