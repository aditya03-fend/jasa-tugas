"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, Lock, Loader2, Info, Clock, 
  Eye, EyeOff, AlertTriangle, Smartphone, X, ShieldAlert, FileText, CheckSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createOrder, getQueueInfo } from "@/actions/order"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ==========================================
// 🔧 KONFIGURASI HARGA & ADMIN
// ==========================================
const BASE_PRICE = 0; 
const ADMIN_DANA_NUMBER = "088983483105"; // Ganti dengan nomor DANA Admin

export default function OrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // State UI
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  
  // State Toggle Password
  const [showSsoPassword, setShowSsoPassword] = useState(false); // Untuk Step 2 (Input)
  const [showReviewPassword, setShowReviewPassword] = useState(false); // Untuk Step 3 (Review)
  
  const [isAgreed, setIsAgreed] = useState(false);

  // Data Antrean & Harga
  const [queueInfo, setQueueInfo] = useState<{ nextQueueNumber: number, estimatedDays: number } | null>(null);
  const [uniqueCode, setUniqueCode] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({
    namaMhs: "", nim: "", universitas: "", prodi: "", semester: "",
    taskLink: "", ssoUsername: "", ssoPassword: "", mataKuliah: "", judulTugas: "", 
    instruksi: "" 
  });

  // --- INIT DATA ---
  useEffect(() => {
    const code = Math.floor(Math.random() * (9 - 1 + 1) + 1);
    setUniqueCode(code);
    setTotalPrice(BASE_PRICE + code);
    getQueueInfo().then(setQueueInfo);
  }, []);

  // --- HANDLERS ---
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, semester: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.namaMhs || !formData.nim)) {
      alert("Mohon lengkapi Nama dan NIM terlebih dahulu.");
      return;
    }
    setStep(2);
  };

  const prevStep = () => setStep(step - 1);

  // --- HANDLER STEP 2 -> MODAL ---
  const handleOpenExplanation = () => {
    if (!formData.taskLink || !formData.judulTugas) {
      alert("Mohon lengkapi Link Tugas dan Judul Tugas.");
      return;
    }
    setShowExplanationModal(true);
  };

  // --- HANDLER MODAL -> STEP 3 ---
  const handleProceedToStep3 = () => {
    setShowExplanationModal(false);
    setStep(3);
  };

  // --- LOGIC: PEMBAYARAN FINAL ---
  const handleFinalProcess = async () => {
    setIsLoading(true);
    try {
      const result = await createOrder({
        ...formData,
        price: totalPrice,
        status: "PAID"
      });
      
      if (result.success) {
        const danaLink = `https://link.dana.id/sendmoney?amount=${totalPrice}&phoneNumber=${ADMIN_DANA_NUMBER}`;
        setTimeout(() => { window.open(danaLink, "_blank"); }, 500);
        router.push(`/dashboard/status/${result.orderId}?success=true`); 
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 relative">
      
      {/* --- MODAL PENJELASAN KODE UNIK (STEP 2 -> 3) --- */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-zinc-200 overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-amber-700">
                   <AlertTriangle className="w-5 h-5" />
                   <CardTitle className="text-lg">Penting: Kode Unik</CardTitle>
                </div>
                <button onClick={() => setShowExplanationModal(false)} className="text-zinc-400 hover:text-black"><X className="w-5 h-5" /></button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-6 text-sm">
              <div className="bg-blue-50 text-blue-900 p-4 rounded-lg text-xs leading-relaxed border border-blue-100">
                 <p className="font-bold mb-2 text-sm">Kenapa nominalnya tidak bulat?</p>
                 <p>
                   Sistem kami menggunakan <strong>3 digit kode unik</strong> (Contoh: Rp 10.<strong>{uniqueCode}</strong>) untuk memverifikasi pembayaran Anda secara otomatis.
                 </p>
                 <br/>
                 <p>
                   Tanpa kode unik, kami tidak bisa membedakan transferan Anda dengan orang lain, yang dapat menyebabkan pesanan Anda <strong>tertunda</strong>.
                 </p>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 leading-none">
                  <label htmlFor="terms" className="text-sm font-medium text-zinc-900 cursor-pointer">
                    Saya mengerti dan setuju
                  </label>
                  <p className="text-xs text-zinc-500">
                    Saya akan mentransfer nominal persis sesuai tagihan (termasuk 3 digit terakhir).
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-zinc-50 pt-4 border-t border-zinc-100">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all" 
                onClick={handleProceedToStep3} 
                disabled={!isAgreed} 
              >
                Lanjut ke Pembayaran <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* --- PROGRESS STEPS --- */}
      <div className="mb-8 flex items-center gap-2 text-sm text-zinc-500 font-medium">
        <span className={step === 1 ? "text-zinc-900 font-bold" : ""}>1. Data Diri</span>
        <ArrowRight className="w-4 h-4 text-zinc-300" />
        <span className={step === 2 ? "text-zinc-900 font-bold" : ""}>2. Detail Tugas</span>
        <ArrowRight className="w-4 h-4 text-zinc-300" />
        <span className={step === 3 ? "text-zinc-900 font-bold" : ""}>3. Pembayaran</span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: IDENTITAS */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader><CardTitle>Identitas Mahasiswa</CardTitle><CardDescription>Isi data diri kamu agar kami tahu siapa yang kami bantu.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nama Lengkap</Label><Input name="namaMhs" value={formData.namaMhs} onChange={handleChange} placeholder="Budi Santoso" /></div>
                  <div className="space-y-2"><Label>NIM</Label><Input name="nim" value={formData.nim} onChange={handleChange} placeholder="12345678" type="number" /></div>
                </div>
                <div className="space-y-2"><Label>Universitas</Label><Input name="universitas" value={formData.universitas} onChange={handleChange} placeholder="Universitas ..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Program Studi</Label><Input name="prodi" value={formData.prodi} onChange={handleChange} placeholder="Ilmu Komputer" /></div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select onValueChange={handleSelectChange} defaultValue={formData.semester}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-zinc-50/50 border-t border-zinc-100 pt-4">
                <Button onClick={nextStep} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6">
                  Lanjut ke Tugas <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: DETAIL TUGAS */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Detail Tugas</CardTitle>
                <CardDescription>Berikan akses dan instruksi pengerjaan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {queueInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-900 animate-in fade-in zoom-in-95 duration-500">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-bold">Estimasi Pengerjaan</p>
                      <p>Selesai dalam <strong>{queueInfo.estimatedDays * 24} Jam</strong> / <strong>{queueInfo.estimatedDays} Hari</strong>.</p>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm"><Lock className="w-4 h-4 text-blue-600" /> Akses Portal Kampus (Aman)</div>
                  <div className="space-y-2"><Label className="text-xs font-semibold text-zinc-500 uppercase">Link Web Tugas</Label><Input name="taskLink" value={formData.taskLink} onChange={handleChange} placeholder="https://elearning.kampus.ac.id/..." className="bg-white" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs font-semibold text-zinc-500 uppercase">Username SSO</Label><Input name="ssoUsername" value={formData.ssoUsername} onChange={handleChange} placeholder="NIM / Email" className="bg-white" /></div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-500 uppercase">Password SSO</Label>
                      <div className="relative">
                        <Input name="ssoPassword" value={formData.ssoPassword} onChange={handleChange} type={showSsoPassword ? "text" : "password"} placeholder="******" className="bg-white pr-10"/>
                        <button type="button" onClick={() => setShowSsoPassword(!showSsoPassword)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors">{showSsoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Mata Kuliah</Label><Input name="mataKuliah" value={formData.mataKuliah} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Judul Tugas</Label><Input name="judulTugas" value={formData.judulTugas} onChange={handleChange} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="w-4 h-4 text-zinc-500" /> Jawaban yang Diinginkan</Label>
                    <Textarea name="instruksi" value={formData.instruksi} onChange={handleChange} placeholder="Jelaskan format jawaban..." className="min-h-[120px] resize-none" />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between gap-3 bg-zinc-50/50 border-t border-zinc-100 pt-4">
                <Button variant="ghost" onClick={prevStep} disabled={isLoading}>Kembali</Button>
                {/* Tombol Simpan Draft DIHAPUS */}
                <Button onClick={handleOpenExplanation} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-200/50">
                  Lanjut Pembayaran
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: PEMBAYARAN (SLIDE BARU) */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Card className="border-zinc-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-1">Total Tagihan</h2>
                <div className="text-4xl font-extrabold tracking-tight">Rp {totalPrice.toLocaleString()}</div>
                <p className="text-blue-100 text-sm mt-2 opacity-90">Termasuk kode unik verifikasi {uniqueCode}</p>
              </div>

              <CardContent className="space-y-6 pt-6">
                
                {/* 1. CEK SSO (DENGAN TOGGLE PASSWORD) */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-yellow-800 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <h3>Cek Login Kampus (SSO)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs bg-white p-3 rounded border border-yellow-100">
                    <div>
                        <span className="text-zinc-500 block mb-1">Username</span>
                        <span className="font-mono font-medium text-zinc-900 bg-zinc-50 px-2 py-1 rounded block truncate">{formData.ssoUsername || "-"}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500 block mb-1">Password</span>
                        <div className="relative">
                            <span className="font-mono font-medium text-zinc-900 bg-zinc-50 px-2 py-1 rounded block pr-8">
                                {showReviewPassword ? (formData.ssoPassword || "-") : (formData.ssoPassword ? "••••••" : "-")}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setShowReviewPassword(!showReviewPassword)}
                                className="absolute right-2 top-1 text-zinc-400 hover:text-zinc-700"
                            >
                                {showReviewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 leading-relaxed">*Pastikan username dan password <strong>BENAR</strong> agar pengerjaan lancar.</p>
                </div>

                {/* 2. RINCIAN HARGA */}
                <div className="space-y-3">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Info className="w-4 h-4 text-blue-600" /> Rincian Transaksi</h3>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-3">
                      <div className="flex justify-between text-zinc-600"><span>Harga Jasa</span><span>Rp {BASE_PRICE.toLocaleString()}</span></div>
                      <div className="flex justify-between text-zinc-600"><span>Kode Unik</span><span className="font-mono text-black font-bold">+{uniqueCode}</span></div>
                      <Separator className="border-dashed" />
                      <div className="flex justify-between items-center text-base"><span className="font-bold text-zinc-900">Total Transfer</span><span className="font-bold text-xl text-blue-700">Rp {totalPrice.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* 3. INSTRUKSI BAYAR */}
                <div className="bg-zinc-900 text-white p-4 rounded-lg text-xs flex gap-3 items-start shadow-sm">
                   <Smartphone className="w-5 h-5 mt-0.5 shrink-0 text-yellow-400" />
                   <p className="leading-relaxed opacity-90">
                     Aplikasi <strong>DANA</strong> akan terbuka otomatis ke nomor admin <strong>{ADMIN_DANA_NUMBER}</strong>. Pastikan nominal transfer sesuai (jangan dibulatkan).
                   </p>
                </div>

              </CardContent>
              
              <CardFooter className="flex gap-3 bg-zinc-50 pt-4 border-t border-zinc-100">
                <Button variant="outline" className="flex-1" onClick={prevStep} disabled={isLoading}>Kembali</Button>
                <Button className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={handleFinalProcess} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Buka DANA & Bayar"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}