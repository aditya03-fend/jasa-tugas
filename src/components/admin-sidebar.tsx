"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CheckCircle, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; 

// Menu navigasi admin
const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Semua Pesanan", href: "/admin/orders", icon: ShoppingCart },
  { title: "Pesanan Selesai", href: "/admin/completed", icon: CheckCircle },
  { title: "Laporan Keuangan", href: "/admin/finance", icon: Wallet },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true); // State untuk buka/tutup sidebar
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 250 : 70 }}
      className="h-screen bg-white border-r border-zinc-200 sticky top-0 flex flex-col z-20 shadow-sm transition-all"
    >
      {/* Header Sidebar */}
      <div className={cn("flex items-center p-4 h-16", isOpen ? "justify-between" : "justify-center")}>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="font-bold text-lg tracking-tighter"
          >
            JasaTugas<span className="text-red-600">Admin</span>
          </motion.div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)} 
          className="h-8 w-8 text-zinc-500 hover:text-black"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigasi Links */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-md" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
                )}
              >
                <Icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-white" : "text-zinc-500 group-hover:text-black")} />
                
                {/* Teks Menu (Hanya muncul jika isOpen) */}
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}

                {/* Tooltip saat sidebar tertutup */}
                {!isOpen && (
                  <div className="absolute left-14 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Tombol Logout */}
      <div className="p-2 border-t border-zinc-100">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 group relative",
            !isOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-sm whitespace-nowrap"
            >
              Keluar
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}