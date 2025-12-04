import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminFinancePage() {
  // 1. Security Check
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return redirect("/dashboard");

  // 2. Ambil Data Transaksi (Yang sudah bayar)
  const transactions = await db.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSED", "COMPLETED"] } // Hanya ambil yang sudah ada uang masuk
    },
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  // 3. Hitung Total
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h1>
            <p className="text-zinc-500 text-sm">Rekapitulasi pemasukan dari jasa tugas.</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* RINGKASAN SALDO */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-900 text-white border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Pemasukan Bersih</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-zinc-400 mt-1">Total akumulasi dari awal.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Transaksi Berhasil</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Order valid terbayar.</p>
          </CardContent>
        </Card>
      </div>

      {/* TABEL MUTASI */}
      <Card>
        <CardHeader>
          <CardTitle>Mutasi Transaksi</CardTitle>
          <CardDescription>Daftar riwayat pembayaran masuk dari user.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Ref ID</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                    Belum ada transaksi masuk.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {trx.createdAt.toLocaleDateString("id-ID", { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">Pembayaran Order #{trx.id.slice(-4)}</div>
                      <div className="text-xs text-zinc-500">Oleh: {trx.namaMhs}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">DANA</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {trx.paymentProof ? trx.paymentProof.split("-").pop() : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      + Rp {trx.price.toLocaleString("id-ID")}
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