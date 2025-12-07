import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ExternalLink, CheckCircle, User, 
  CreditCard, Shield, XCircle // Icon baru
} from "lucide-react";
import { updateOrderStatus } from "@/actions/admin"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return redirect("/dashboard");

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!order) return notFound();

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detail Order #{order.id.slice(-4)}</h1>
            <p className="text-zinc-500 text-sm">Dibuat pada {order.createdAt.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* TOMBOL AKSI STATUS */}
        <div className="flex items-center gap-3">
          
          {/* Tombol Tolak Pembayaran (Muncul jika status PAID atau PROCESSED) */}
          {(order.status === "PAID" || order.status === "PROCESSED") && (
            <form action={async () => {
              "use server";
              // Ubah status jadi UNPAID (Merah)
              await updateOrderStatus(id, "UNPAID"); 
            }}>
              <Button type="submit" variant="destructive" className="shadow-sm">
                <XCircle className="w-4 h-4 mr-2" />
                Tandai Belum Bayar
              </Button>
            </form>
          )}

          {/* Tombol Selesai */}
          {(order.status === "PAID" || order.status === "PROCESSED") && (
            <form action={async () => {
              "use server";
              await updateOrderStatus(id, "COMPLETED");
            }}>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandai Selesai
              </Button>
            </form>
          )}

          {order.status === "COMPLETED" && (
             <Button disabled variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 mr-2" /> Sudah Selesai
             </Button>
          )}

          {order.status === "UNPAID" && (
             <Button disabled variant="outline" className="text-red-600 border-red-200 bg-red-50">
                <XCircle className="w-4 h-4 mr-2" /> Pembayaran Ditolak
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: DETAIL TUGAS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* INFORMASI TUGAS */}
          <Card>
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Instruksi Pengerjaan</CardTitle>
                  <CardDescription>Detail yang diberikan mahasiswa.</CardDescription>
                </div>
                {/* Badge Status Update */}
                <Badge className={
                  order.status === "PENDING" ? "bg-yellow-500" :
                  order.status === "UNPAID" ? "bg-red-600 hover:bg-red-700" : // Merah
                  order.status === "PAID" ? "bg-blue-600" : 
                  "bg-green-600"
                }>
                  {order.status === "UNPAID" ? "DITOLAK / BELUM BAYAR" : order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Mata Kuliah</label>
                  <p className="font-medium text-lg">{order.mataKuliah}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Judul Tugas</label>
                  <p className="font-medium text-lg">{order.judulTugas}</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Catatan / Instruksi</label>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {order.instruksi || "Tidak ada instruksi tambahan."}
                </p>
              </div>

              {/* LINK & SSO SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-50 p-2 rounded"><ExternalLink className="w-4 h-4 text-blue-600" /></div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-zinc-500 font-bold">Link Tugas</p>
                      <a href={order.taskLink} target="_blank" className="text-sm text-blue-600 hover:underline truncate block max-w-[300px] md:max-w-[400px]">
                        {order.taskLink}
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={order.taskLink} target="_blank">Buka</a>
                  </Button>
                </div>

                {(order.ssoUsername || order.ssoPassword) && (
                  <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
                      <Shield className="w-4 h-4" /> Kredensial Akses (SSO)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <p className="text-xs text-zinc-400">Username</p>
                        <p className="font-mono font-medium select-all">{order.ssoUsername}</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <p className="text-xs text-zinc-400">Password</p>
                        <p className="font-mono font-medium select-all">{order.ssoPassword}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* KOLOM KANAN: INFO USER & PEMBAYARAN */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4"/> Data Mahasiswa</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-zinc-500">Nama Lengkap</label>
                <p className="font-medium">{order.namaMhs}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">NIM</label>
                <p className="font-medium">{order.nim}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Kampus</label>
                <p className="font-medium">{order.universitas}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Prodi / Semester</label>
                <p className="font-medium">{order.prodi} (Sem {order.semester})</p>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <User className="w-3 h-3" /> Akun: {order.user.email}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4"/> Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>Rp {order.price.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Status</span>
                <span className={`font-bold ${order.status === 'UNPAID' ? 'text-red-600' : 'text-black'}`}>
                    {order.status === "PENDING" ? "Belum Bayar" : 
                     order.status === "UNPAID" ? "DITOLAK / INVALID" : "Lunas"}
                </span>
              </div>
              <div className="bg-zinc-100 p-2 rounded text-xs font-mono break-all">
                Ref: {order.paymentProof || "-"}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}