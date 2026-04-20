import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Journaler",
  description: "Your personal journal",
};

export const viewport: Viewport = {
  themeColor: "#7c6af7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
