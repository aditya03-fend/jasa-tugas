import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  MoreHorizontal
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

export default async function AdminDashboardPage() {
  // 1. Cek Sesi Admin (Double Check selain di layout)
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return redirect("/dashboard");

  // 2. Ambil Data Statistik secara Paralel (Biar Cepat)
  const [activeCount, completedCount, totalRevenueData, queueOrders] = await Promise.all([
     // Hitung Order Aktif (PAID/PROCESSED)
     db.order.count({ 
        where: { status: { in: ["PAID", "PROCESSED"] } } 
     }),
     // Hitung Order Selesai
     db.order.count({ 
        where: { status: "COMPLETED" } 
     }),
     // Hitung Total Pendapatan (Hanya yang sudah bayar)
     db.order.aggregate({ 
        _sum: { price: true }, 
        where: { status: { in: ["PAID", "PROCESSED", "COMPLETED"] } } 
     }),
     // Ambil Orderan Antrean (PAID/PROCESSED), urutkan dari yang terlama (Antrean 1)
     db.order.findMany({ 
        where: { status: { in: ["PAID", "PROCESSED"] } },
        orderBy: { createdAt: "asc" }, // Ascending: Order terlama di paling atas (Prioritas)
        take: 10, // Tampilkan 10 antrean teratas
        include: { user: true } 
     })
  ]);

  const totalRevenue = totalRevenueData._sum.price || 0;

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
          <p className="text-zinc-500">Ringkasan performa joki tugas hari ini.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>Download Laporan</Button>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* Card 1: Pendapatan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-zinc-500">Dari order valid</p>
          </CardContent>
        </Card>

        {/* Card 2: Order Aktif */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Dikerjakan</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-zinc-500">Order aktif saat ini</p>
          </CardContent>
        </Card>

        {/* Card 3: Selesai */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-zinc-500">Total order selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* QUEUE ORDERS TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Antrean Pengerjaan</CardTitle>
            <CardDescription>
              Daftar tugas aktif yang harus segera dikerjakan (Prioritas Waktu).
            </CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              Lihat Semua <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
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
                  <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                    Tidak ada antrean. Semua tugas sudah selesai! 🎉
                  </TableCell>
                </TableRow>
              ) : (
                queueOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.namaMhs}</div>
                      <div className="text-xs text-zinc-500">{order.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[200px]">{order.judulTugas}</div>
                      <div className="text-xs text-zinc-500">{order.mataKuliah}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {order.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  );
}