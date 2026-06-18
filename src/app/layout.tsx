import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PPDI Kecamatan Cikampek - Portal Resmi Perangkat Desa",
  description: "Portal resmi Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek. Informasi organisasi, berita, kegiatan, agenda, dan layanan perangkat desa.",
  keywords: "PPDI, PPDI Cikampek, Perangkat Desa, Cikampek, Karawang, Organisasi Desa, Pemerintahan Desa",
  authors: [{ name: "PPDI Kecamatan Cikampek" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PPDI Kecamatan Cikampek",
    description: "Portal resmi Persatuan Perangkat Desa Indonesia Kecamatan Cikampek",
    siteName: "PPDI Cikampek",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
