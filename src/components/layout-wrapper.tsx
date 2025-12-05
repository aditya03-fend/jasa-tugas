"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export default function LayoutWrapper({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const pathname = usePathname();

  // Daftar halaman yang TIDAK boleh menampilkan Navbar/Footer global
  const isSpecialPage = pathname.startsWith("/admin") || pathname.startsWith("/payment");

  // Jika halaman khusus (Admin/Payment), render kontennya saja tanpa layout
  if (isSpecialPage) {
    return <>{children}</>;
  }

  // Jika halaman biasa (User), tampilkan Navbar & Footer
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- GLOBAL NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-serif italic">
              J
            </div>
            <span className="hidden sm:inline-block">JasaTugas.id</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mr-2">
                  <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                    <User className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="hidden md:block text-sm">
                    <p className="font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                  </div>
                </div>
                
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      Dashboard
                    </Button>
                </Link>

                <Link href="/api/auth/signout">
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium text-zinc-600 hover:text-zinc-900">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register"> 
                  <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-5">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
          
        </div>
      </header>

      {/* Konten Halaman */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center text-zinc-400 text-sm border-t border-zinc-100">
        <p>&copy; 2024 JasaTugas.id - Teman Begadang Mahasiswa.</p>
      </footer>

    </div>
  );
}