import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Header from "@/components/layout/Header";
import MobileBackBar from "@/components/layout/MobileBackBar";
import Footer from "@/components/layout/Footer";
import SiteBackground from "@/components/layout/SiteBackground";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "ابتسامة — عيادة أسنان",
  description: "احجز موعدك بسهولة في عيادة ابتسامة للأسنان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="relative min-h-full font-sans antialiased">
        <SiteBackground />
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-14">
            <MobileBackBar />
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
