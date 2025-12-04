import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminCompletedPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return redirect("/dashboard");

  // Ambil hanya yang statusnya COMPLETED
  const orders = await db.order.findMany({
    where: { status: "COMPLETED" },
    orderBy: { updatedAt: "desc" }, // Urutkan dari yang baru selesai
    include: { user: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Pesanan Selesai</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Arsip Tugas ({orders.length})</CardTitle>
            <p className="text-sm text-zinc-500">Daftar tugas yang telah diselesaikan dan diserahkan.</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Selesai Pada</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Judul Tugas</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead className="text-right">Pendapatan</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                    Belum ada tugas yang selesai. Semangat kerjanya!
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {order.updatedAt.toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.namaMhs}</div>
                      <div className="text-xs text-zinc-500">{order.user.email}</div>
                    </TableCell>
                    <TableCell className="font-medium">{order.judulTugas}</TableCell>
                    <TableCell>{order.mataKuliah}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      + Rp {order.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">Detail</Button>
                      </Link>
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