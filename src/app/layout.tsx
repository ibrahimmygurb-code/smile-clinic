import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteBackground from "@/components/SiteBackground";
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="relative min-h-full font-sans antialiased">
        <SiteBackground />
        <Header />
        <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
