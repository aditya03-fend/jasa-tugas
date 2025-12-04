import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth"; // Helper auth yang sudah kita buat
import { cn } from "@/lib/utils";
import LayoutWrapper from "@/components/layout-wrapper"; // Import wrapper client baru

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JasaTugas.id - Joki Tugas Mahasiswa Terpercaya",
  description: "Bantuan tugas kuliah cepat, aman, dan murah.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Ambil data session di Server Component
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="id">
      <body className={cn(inter.className, "bg-white min-h-screen")}>
        {/* 2. Bungkus children dengan LayoutWrapper 
          Wrapper ini yang akan menentukan apakah Navbar ditampilkan atau tidak 
          berdasarkan URL (Admin vs User)
        */}
        <LayoutWrapper user={user}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}