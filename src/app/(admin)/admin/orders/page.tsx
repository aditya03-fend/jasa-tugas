import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, ArrowLeft, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Props untuk menangkap searchParams (Next.js 15 Style)
type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminOrdersPage(props: Props) {
  // 1. Cek Sesi Admin
  const session = await auth();
  
  // Menggunakan casting (as any) untuk bypass error TypeScript pada properti role
  if ((session?.user as any)?.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  // 2. Tangkap Filter dari URL
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || "all"; // default: all

  // 3. Logika Query Database berdasarkan Filter
  // Jika filter = 'today', kita cari yang statusnya PAID/PROCESSED (Harus dikerjakan)
  // Jika filter = 'all', kita ambil semua
  const whereClause = filter === "today" 
    ? { status: { in: ["PAID", "PROCESSED"] } } 
    : {}; // Kosong berarti ambil semua

  // 4. Ambil Data dari Database
  const orders = await db.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="space-y-6">
      
      {/* --- HEADER & FILTER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pesanan</h1>
        </div>
        
        {/* NAVIGASI FILTER */}
        <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
          <Link href="/admin/orders?filter=all">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "rounded-md text-sm font-medium transition-all", 
                filter === "all" ? "bg-zinc-100 text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Semua Orderan
            </Button>
          </Link>
          <Link href="/admin/orders?filter=today">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "rounded-md text-sm font-medium transition-all gap-2", 
                filter === "today" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Filter className="w-3 h-3" />
              Kerjakan Hari Ini
            </Button>
          </Link>
        </div>
      </div>

      {/* --- TABEL PESANAN --- */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "today" ? "Antrean Pengerjaan (Active)" : "Semua Riwayat Pesanan"} 
            <span className="ml-2 text-zinc-400 font-normal text-sm">({orders.length} Data)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Detail Tugas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-zinc-500">
                    {filter === "today" ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-lg font-medium text-zinc-900">Tidak ada tugas aktif!</span>
                        <span>Semua tugas sudah selesai atau belum ada yang bayar.</span>
                      </div>
                    ) : (
                      "Belum ada data pesanan sama sekali."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  // Baris akan berwarna merah tipis jika status UNPAID
                  <TableRow key={order.id} className={order.status === 'UNPAID' ? "bg-red-50/50 hover:bg-red-50" : ""}>
                    <TableCell className="font-mono text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.namaMhs}</div>
                      <div className="text-xs text-zinc-500">{order.nim}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate" title={order.judulTugas}>{order.judulTugas}</div>
                      <div className="text-xs text-zinc-500">{order.mataKuliah}</div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={
                          order.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          order.status === "UNPAID" ? "bg-red-100 text-red-700 border-red-200 font-bold hover:bg-red-200" : // Status Merah
                          order.status === "DRAFT" ? "bg-zinc-100 text-zinc-600 border-zinc-200" :
                          (order.status === "PAID" || order.status === "PROCESSED") ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-green-50 text-green-700 border-green-200"
                        }>
                          {order.status === "PAID" || order.status === "PROCESSED" ? "PERLU DIKERJAKAN" : 
                           order.status === "UNPAID" ? "DITOLAK / INVALID" : 
                           order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Menu</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>Buka Detail</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}