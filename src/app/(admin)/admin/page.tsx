import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  MoreHorizontal,
  Filter,
  Timer,
  CheckCircle2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Props untuk menangkap searchParams
type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminDashboardPage(props: Props) {
  // 1. Cek Sesi Admin
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return redirect("/dashboard");

  // 2. Tangkap Filter
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || "all"; // 'all' | 'today'

  // 3. Ambil Data Statistik secara Paralel
  const [activeCount, totalRevenueData, queueOrders] = await Promise.all([
     // Hitung Order Aktif (PAID/PROCESSED)
     db.order.count({ 
        where: { status: { in: ["PAID", "PROCESSED"] } } 
     }),
     // Hitung Total Pendapatan
     db.order.aggregate({ 
        _sum: { price: true }, 
        where: { status: { in: ["PAID", "PROCESSED", "COMPLETED"] } } 
     }),
     // Ambil Orderan Antrean (PAID/PROCESSED)
     // Jika filter 'today', kita ambil 20 teratas (Kapasitas harian)
     // Jika 'all', kita ambil 50
     db.order.findMany({ 
        where: { status: { in: ["PAID", "PROCESSED"] } },
        orderBy: { createdAt: "asc" }, // Prioritas waktu (FIFO)
        take: filter === "today" ? 20 : 50,
        include: { user: true } 
     })
  ]);

  const totalRevenue = totalRevenueData._sum.price || 0;

  // Helper untuk Tombol Filter
  const FilterTab = ({ label, value }: { label: string, value: string }) => {
    const isActive = filter === value;
    return (
      <Link href={`/admin?filter=${value}`}>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "rounded-full transition-all text-xs h-8", 
            isActive ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-100"
          )}
        >
          {label}
        </Button>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
          <p className="text-zinc-500">Ringkasan performa & antrean tugas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>Download Laporan</Button>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-zinc-500">Akumulasi semua order valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antrean Pengerjaan</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-zinc-500">Tugas yang harus diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* QUEUE ORDERS TABLE */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Antrean Pengerjaan
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                {filter === "today" ? "Prioritas Hari Ini (Top 20)" : "Semua Antrean"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Daftar tugas aktif yang harus segera dikerjakan (Urutan Prioritas).
            </CardDescription>
          </div>
          
          {/* FILTER TABS */}
          <div className="flex items-center bg-zinc-100/50 p-1 rounded-full border border-zinc-200">
            <FilterTab label="Semua Antrean" value="all" />
            <FilterTab label="Target Hari Ini" value="today" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">No.</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tugas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <p className="font-medium text-zinc-900">Semua Beres!</p>
                      <p className="text-xs">Tidak ada tugas yang perlu dikerjakan saat ini.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queueOrders.map((order, index) => {
                  // LOGIKA HITUNG MUNDUR
                  // Rumus: Setiap 20 antrean nambah 1 hari dari tanggal order
                  const estimatedDayBatch = Math.ceil((index + 1) / 20);
                  const deadlineDate = new Date(order.createdAt.getTime() + (estimatedDayBatch * 24 * 60 * 60 * 1000));
                  const now = new Date();
                  const diffMs = deadlineDate.getTime() - now.getTime();
                  const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60)); // Konversi ke Jam

                  // Warna Badge Sisa Waktu
                  let timeColor = "bg-green-100 text-green-800";
                  if (hoursLeft < 0) timeColor = "bg-red-100 text-red-800 animate-pulse"; // Telat
                  else if (hoursLeft < 5) timeColor = "bg-red-100 text-red-800"; // Kritis
                  else if (hoursLeft < 12) timeColor = "bg-yellow-100 text-yellow-800"; // Warning

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-center text-zinc-500">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${timeColor}`}>
                           <Timer className="w-3 h-3" />
                           {hoursLeft < 0 ? `${Math.abs(hoursLeft)} Jam Telat` : `${hoursLeft} Jam Lagi`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.namaMhs}</div>
                        <div className="text-xs text-zinc-500">{order.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[180px]" title={order.judulTugas}>{order.judulTugas}</div>
                        <div className="text-xs text-zinc-500">{order.mataKuliah}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-zinc-600">
                        Rp {order.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-black">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>Lihat Detail & Proses</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  );
}