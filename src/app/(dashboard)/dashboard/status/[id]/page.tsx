import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  User, 
  GraduationCap,
  Link as LinkIcon, 
  Lock, 
  MoreHorizontal,
  XCircle,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { retryPayment } from "@/actions/order"; // Import action retry

// Force Dynamic agar data selalu fresh (tidak di-cache statis)
export const dynamic = "force-dynamic";

// Konstanta Nomor Admin (Pastikan sama dengan di halaman order)
const ADMIN_DANA_NUMBER = "081234567890"; 

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Cek User Login
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 2. Await params (Wajib di Next.js 15)
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // 3. Ambil Detail Order
  const order = await db.order.findFirst({
    where: { 
      id: orderId, 
      userId: (session.user as any).id 
    },
  });

  if (!order) return notFound();

  // 4. Hitung Posisi Antrean & Estimasi (Hanya jika sedang dikerjakan)
  let queuePosition = 0;
  let daysEstimation = 0;

  if (order.status === "PAID" || order.status === "PROCESSED") {
    const count = await db.order.count({
      where: {
        status: { in: ["PAID", "PROCESSED"] },
        createdAt: { lt: order.createdAt },
      },
    });
    queuePosition = count + 1;
    daysEstimation = Math.ceil(queuePosition / 20); 
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 pb-10">
      
      {/* HEADER NAVIGASI */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Tugas</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-mono">#{order.id.slice(-6)}</span>
            <span>•</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (STATUS UTAMA & DETAIL TUGAS) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* CARD STATUS & ESTIMASI */}
          <Card className="border-zinc-200 overflow-hidden">
            {/* Header Card dengan Warna Dinamis */}
            <div className={`p-6 text-white ${order.status === 'UNPAID' ? 'bg-red-600' : 'bg-zinc-900'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Status Pengerjaan</p>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {order.status === "DRAFT" && "Draft (Belum Selesai)"}
                    {order.status === "PENDING" && "Menunggu Pembayaran"}
                    {order.status === "UNPAID" && "Pembayaran Ditolak"}
                    {(order.status === "PAID" || order.status === "PROCESSED") && "Sedang Dikerjakan"}
                    {order.status === "COMPLETED" && "Selesai"}
                  </h2>
                </div>
                {/* Badge Kanan Atas */}
                {(order.status === "PAID" || order.status === "PROCESSED") && (
                   <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">ON PROCESS</div>
                )}
                {order.status === "UNPAID" && (
                   <div className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <XCircle className="w-3 h-3" /> DITOLAK
                   </div>
                )}
                {order.status === "COMPLETED" && (
                   <div className="bg-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> SELESAI
                   </div>
                )}
              </div>
            </div>

            <CardContent className="p-6">
               
               {/* --- KONDISI 1: UNPAID (DITOLAK) --- */}
               {order.status === "UNPAID" && (
                 <div className="text-center py-4">
                   <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-800 mb-6 text-left">
                     <p className="font-bold mb-1 flex items-center gap-2"><XCircle className="w-4 h-4"/> Pembayaran Tidak Valid</p>
                     <p className="text-sm">
                       Admin menolak pembayaran ini. Kemungkinan nominal transfer tidak sesuai (kurang kode unik) atau bukti tidak valid. 
                       Silakan transfer ulang sesuai nominal yang benar lalu klik tombol di bawah.
                     </p>
                   </div>
                   
                   {/* Form Action untuk Retry (Server Action + Redirect) */}
                   <form action={async () => {
                      "use server";
                      // 1. Update status kembali ke PAID agar masuk antrean admin lagi
                      await retryPayment(order.id);
                      // 2. Redirect langsung ke Deep Link DANA
                      redirect(`https://link.dana.id/sendmoney?amount=${order.price}&phoneNumber=${ADMIN_DANA_NUMBER}`);
                   }}>
                      <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto shadow-md">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Bayar Ulang via DANA (Rp {order.price.toLocaleString()})
                      </Button>
                   </form>
                 </div>
               )}

               {/* --- KONDISI 2: PENDING / DRAFT --- */}
               {(order.status === "PENDING" || order.status === "DRAFT") && (
                 <div className="text-center py-6">
                   <p className="mb-4 text-zinc-600">
                     {order.status === "DRAFT" ? "Pesanan ini masih draft." : "Pesanan ini belum dibayar."} 
                     <br/>Silakan lanjutkan pembayaran agar kami bisa mulai mengerjakan.
                   </p>
                   {/* Redirect ke halaman order form agar user bisa review & bayar */}
                   <Link href={`/order`}> 
                      <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        Lanjut Pembayaran (Rp {order.price.toLocaleString()})
                      </Button>
                   </Link>
                 </div>
               )}

               {/* --- KONDISI 3: ACTIVE / COMPLETED --- */}
               {(order.status === "PAID" || order.status === "PROCESSED" || order.status === "COMPLETED") && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-center">
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Antrean Kamu</p>
                        {order.status === "COMPLETED" ? (
                          <p className="text-3xl font-bold text-green-600">Done</p>
                        ) : (
                          <p className="text-3xl font-bold text-zinc-900">#{queuePosition}</p>
                        )}
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-center">
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Estimasi Selesai</p>
                        {order.status === "COMPLETED" ? (
                          <p className="text-3xl font-bold text-zinc-400">-</p>
                        ) : (
                          <p className="text-3xl font-bold text-blue-600">{daysEstimation} Hari</p>
                        )}
                    </div>
                    {order.status !== "COMPLETED" && (
                      <div className="col-span-2 bg-blue-50/50 p-4 rounded-lg text-sm text-blue-900 border border-blue-100 flex gap-3">
                          <Clock className="w-5 h-5 flex-shrink-0 text-blue-600" />
                          <p>
                            Kami mengerjakan 20 tugas/hari. Karena kamu urutan ke-<strong>{queuePosition}</strong>, 
                            tugasmu diprediksi selesai pada tanggal <strong>{new Date(Date.now() + daysEstimation * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}</strong>.
                          </p>
                      </div>
                    )}
                 </div>
               )}
            </CardContent>
          </Card>

          {/* CARD DETAIL TUGAS */}
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-500" />
                Informasi Tugas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-1">Mata Kuliah</p>
                  <p className="font-semibold">{order.mataKuliah}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-1">Judul Tugas</p>
                  <p className="font-semibold">{order.judulTugas}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-zinc-500 mb-2">Jawaban yang Diinginkan</p>
                <div className="bg-zinc-50 p-4 rounded-md text-sm leading-relaxed border border-zinc-100 whitespace-pre-wrap">
                  {order.instruksi || "Tidak ada detail jawaban khusus."}
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-3 bg-white border border-zinc-200 p-3 rounded-lg">
                    <div className="bg-zinc-100 p-2 rounded-md"><LinkIcon className="w-4 h-4" /></div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-zinc-500">Link Sumber Tugas</p>
                        <a href={order.taskLink} target="_blank" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                            {order.taskLink}
                        </a>
                    </div>
                 </div>

                 {(order.ssoUsername || order.ssoPassword) && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                        <div className="bg-amber-100 p-2 rounded-md"><Lock className="w-4 h-4 text-amber-700" /></div>
                        <div>
                            <p className="text-xs text-amber-800 font-bold">Kredensial SSO Tersimpan</p>
                            <p className="text-xs text-amber-700">Username: {order.ssoUsername || "-"} | Password: ••••••</p>
                        </div>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* KOLOM KANAN (SIDEBAR INFO MAHASISWA & TAGIHAN) */}
        <div className="space-y-6">
            
            <Card className="border-zinc-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" /> Mahasiswa
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <div>
                        <p className="text-zinc-500 text-xs">Nama Lengkap</p>
                        <p className="font-medium">{order.namaMhs}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs">NIM</p>
                        <p className="font-medium">{order.nim}</p>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                        <GraduationCap className="w-8 h-8 text-zinc-300" />
                        <div>
                            <p className="font-medium">{order.universitas}</p>
                            <p className="text-zinc-500 text-xs">{order.prodi} - Sem {order.semester}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Pembayaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Harga Jasa</span>
                        <span className="font-bold">Rp {order.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Metode</span>
                        <span>DANA</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500">ID Transaksi</span>
                        <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">
                            {order.paymentProof ? order.paymentProof.split("-").pop() : "-"}
                        </span>
                    </div>
                    
                    {/* Status Text di Bawah Card */}
                    {order.status === "UNPAID" && (
                        <div className="bg-red-50 text-red-700 p-2 rounded text-xs text-center font-bold flex items-center justify-center gap-1 border border-red-100">
                            <XCircle className="w-3 h-3" /> Pembayaran Ditolak
                        </div>
                    )}
                    {(order.status === "PAID" || order.status === "PROCESSED") && (
                        <div className="bg-green-50 text-green-700 p-2 rounded text-xs text-center font-medium flex items-center justify-center gap-1 border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> Lunas
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-center">
                <Button variant="ghost" className="text-xs text-zinc-400 hover:text-zinc-600">
                    <MoreHorizontal className="w-3 h-3 mr-1" /> Laporkan Masalah
                </Button>
            </div>

        </div>

      </div>
    </div>
  );
}