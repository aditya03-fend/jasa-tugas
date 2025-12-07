import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Filter, 
  XCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Props untuk menangkap searchParams (Next.js 15 Style)
type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function DashboardPage(props: Props) {
  // 1. Cek User Login (Server Side Security)
  const session = await auth();
  
  // Jika user belum login, lempar ke halaman login
  if (!session?.user) {
    redirect("/login");
  }

  // 2. Tangkap Filter dari URL
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || "all";

  // 3. Logic Query Database berdasarkan Filter
  let statusCondition: any = {};

  if (filter === "pending") {
    // Tampilkan PENDING dan UNPAID (Ditolak) di tab "Bayar"
    statusCondition = { status: { in: ["PENDING", "UNPAID"] } };
  } else if (filter === "process") {
    // Proses mencakup yang sudah bayar (PAID) atau sedang dikerjakan (PROCESSED)
    statusCondition = { status: { in: ["PAID", "PROCESSED"] } };
  } else if (filter === "completed") {
    statusCondition = { status: "COMPLETED" };
  }
  // Jika filter == 'all', statusCondition tetap kosong (ambil semua)

  // 4. Ambil Orderan User dari Database
  const orders = await db.order.findMany({
    where: {
      // Menggunakan casting (as any) untuk bypass error TypeScript pada properti id
      userId: (session.user as any).id,
      ...statusCondition, 
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Helper Component untuk Tombol Filter
  const FilterButton = ({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) => {
    const isActive = filter === value;
    return (
      <Link href={`/dashboard?filter=${value}`}>
        <Button 
          variant={isActive ? "default" : "outline"} 
          size="sm"
          className={cn(
            "rounded-full transition-all", 
            isActive ? "bg-zinc-900 text-white" : "text-zinc-600 border-zinc-300 hover:bg-zinc-100"
          )}
        >
          {Icon && <Icon className="w-3 h-3 mr-2" />}
          {label}
        </Button>
      </Link>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 pb-10">
      
      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Halo, {session.user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-zinc-500 mt-1">
            Pantau progres tugasmu atau buat pesanan baru.
          </p>
        </div>
        <Link href="/order">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6 shadow-lg shadow-zinc-200">
            <Plus className="w-4 h-4 mr-2" />
            Order Tugas Baru
          </Button>
        </Link>
      </div>

      {/* --- FILTER TAB --- */}
      <div className="flex flex-wrap items-center gap-2 pb-2 overflow-x-auto scrollbar-none">
        <FilterButton label="Semua" value="all" icon={Filter} />
        <FilterButton label="Sedang Proses" value="process" icon={Clock} />
        <FilterButton label="Bayar / Cek" value="pending" icon={AlertCircle} />
        <FilterButton label="Selesai" value="completed" icon={CheckCircle2} />
      </div>

      {/* --- DAFTAR ORDERAN --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {filter === 'all' && "Semua Riwayat"}
            {filter === 'process' && "Sedang Dikerjakan"}
            {filter === 'pending' && "Menunggu Pembayaran"}
            {filter === 'completed' && "Tugas Selesai"}
          </h2>
          <span className="text-sm text-zinc-500">{orders.length} Tugas</span>
        </div>

        {orders.length === 0 ? (
          // KONDISI: JIKA BELUM ADA ORDERAN
          <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-sm mb-4">
                <Search className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900">Tidak ada tugas ditemukan</h3>
              <p className="text-zinc-500 max-w-sm mb-6 mt-1">
                {filter === 'all' 
                  ? "Kamu belum pernah membuat pesanan." 
                  : "Tidak ada tugas dengan status ini."}
              </p>
              {filter === 'all' && (
                <Link href="/order">
                  <Button variant="outline" className="border-zinc-300">Buat Orderan Pertama</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          // KONDISI: ADA DATA ORDERAN
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              // Semua kartu mengarah ke Halaman Detail agar seragam
              const hrefTarget = `/dashboard/status/${order.id}`;

              // Menentukan Warna Garis Status & Style Card
              let statusColorClass = "bg-green-500"; // Default (Completed)
              let cardBorderClass = "border-zinc-200 hover:border-zinc-300";

              if (order.status === "PENDING") {
                statusColorClass = "bg-yellow-400";
              } else if (order.status === "UNPAID") {
                statusColorClass = "bg-red-600";
                cardBorderClass = "border-red-200 bg-red-50/30 hover:border-red-300";
              } else if (order.status === "PAID" || order.status === "PROCESSED") {
                statusColorClass = "bg-blue-500";
              }

              return (
                <Link href={hrefTarget} key={order.id} className="group">
                  <Card className={cn(
                      "h-full border hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative",
                      cardBorderClass
                    )}>
                    
                    {/* Status Bar di Kiri Card */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColorClass}`} />

                    <CardHeader className="pb-3 pl-6">
                      <div className="flex justify-between items-start mb-1">
                        {/* BADGE STATUS */}
                        {order.status === "PENDING" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Menunggu Bayar
                          </Badge>
                        )}
                        {order.status === "UNPAID" && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                            Pembayaran Ditolak
                          </Badge>
                        )}
                        {(order.status === "PAID" || order.status === "PROCESSED") && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Sedang Dikerjakan
                          </Badge>
                        )}
                        {order.status === "COMPLETED" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Selesai
                          </Badge>
                        )}
                        
                        <span className="text-xs text-zinc-400 font-mono">
                          #{order.id.slice(-4)}
                        </span>
                      </div>
                      
                      <CardTitle className="text-lg font-bold leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {order.judulTugas}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {order.mataKuliah}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pl-6 pb-4">
                      {/* INFORMASI SINGKAT */}
                      <div className="space-y-2 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-400" />
                          <span className="truncate max-w-[200px]">{order.universitas}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span>
                            {order.createdAt.toLocaleDateString("id-ID", { 
                              day: 'numeric', month: 'short', year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>

                      {/* FOOTER CARD */}
                      <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                        {order.status === "PENDING" ? (
                          <div className="flex items-center text-red-600 text-xs font-medium animate-pulse">
                             <AlertCircle className="w-3 h-3 mr-1" /> Segera Bayar
                          </div>
                        ) : order.status === "UNPAID" ? (
                          <div className="flex items-center text-red-700 text-xs font-bold">
                             <XCircle className="w-3 h-3 mr-1" /> Cek Pembayaran
                          </div>
                        ) : (
                          <div className="flex items-center text-zinc-500 text-xs font-medium">
                             Lihat Detail
                          </div>
                        )}
                        
                        <div className="bg-zinc-100 p-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}