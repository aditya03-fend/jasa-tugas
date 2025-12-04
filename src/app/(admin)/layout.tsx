import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar"; // Import komponen sidebar yang baru kita buat

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Cek Sesi (Server Side Check)
  const session = await auth();
  
  // 2. Security: Hanya role ADMIN yang boleh masuk area ini
  // Kita gunakan casting (as any) untuk bypass error TypeScript pada properti role
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/dashboard"); // Tendang balik jika bukan admin
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      
      {/* Sidebar Admin (Client Component) */}
      <AdminSidebar />

      {/* Konten Utama Admin */}
      {/* h-screen & overflow-y-auto membuat hanya konten kanan yang bisa discroll, sidebar tetap diam */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}