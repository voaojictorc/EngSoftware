import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HortiFresh — Sistema de Distribuição",
  description: "Sistema de gestão para distribuidoras de hortaliças e verduras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full bg-slate-50">
        <Sidebar />
        <div className="pl-60 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

