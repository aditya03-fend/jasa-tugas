"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, Loader2, Info, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createOrder, getQueueInfo } from "@/actions/order"; // Import server actions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function OrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk menyimpan info antrean dari server
  const [queueInfo, setQueueInfo] = useState<{ nextQueueNumber: number, estimatedDays: number } | null>(null);

  // State Form Data
  const [formData, setFormData] = useState({
    namaMhs: "", nim: "", universitas: "", prodi: "", semester: "",
    taskLink: "", ssoUsername: "", ssoPassword: "", mataKuliah: "", judulTugas: "", instruksi: ""
  });

  // Ambil data antrean saat halaman dibuka
  useEffect(() => {
    getQueueInfo().then((data) => {
      setQueueInfo(data);
    });
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, semester: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.namaMhs || !formData.nim)) {
      alert("Mohon isi Nama dan NIM terlebih dahulu.");
      return;
    }
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createOrder(formData);
      
      if (result.error) {
        alert(result.error);
      } else if (result.success) {
        // Redirect ke halaman status (menganggap pembayaran sukses utk testing)
        // Jika ingin simulasi DANA, bisa diganti ke `/payment/${result.orderId}`
        router.push(`/dashboard/status/${result.orderId}?success=true`); 
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      {/* Indikator Progress */}
      <div className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
        <span className={step === 1 ? "text-black font-medium" : ""}>1. Data Diri</span>
        <ArrowRight className="w-4 h-4" />
        <span className={step === 2 ? "text-black font-medium" : ""}>2. Detail Tugas</span>
        <ArrowRight className="w-4 h-4" />
        <span>3. Pembayaran</span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Identitas */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Identitas Mahasiswa</CardTitle>
                <CardDescription>Isi data diri kamu agar kami tahu siapa yang kami bantu.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input name="namaMhs" value={formData.namaMhs} onChange={handleChange} placeholder="Budi Santoso" />
                  </div>
                  <div className="space-y-2">
                    <Label>NIM</Label>
                    <Input name="nim" value={formData.nim} onChange={handleChange} placeholder="12345678" type="number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Universitas</Label>
                  <Input name="universitas" value={formData.universitas} onChange={handleChange} placeholder="Universitas ..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Program Studi</Label>
                    <Input name="prodi" value={formData.prodi} onChange={handleChange} placeholder="Ilmu Komputer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select onValueChange={handleSelectChange} defaultValue={formData.semester}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={nextStep} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  Lanjut ke Tugas <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: Detail Tugas */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Detail Tugas</CardTitle>
                <CardDescription>Berikan akses dan instruksi yang jelas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* --- INFO ANTREAN (WARNING BOX) --- */}
                {queueInfo && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-900 animate-in fade-in zoom-in-95 duration-300">
                    <Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                    <div className="text-sm">
                      <p className="font-bold mb-1">Info Antrean Saat Ini</p>
                      <p>
                        Jika kamu order sekarang, tugasmu akan menjadi urutan ke-<strong>{queueInfo.nextQueueNumber}</strong>.
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        Estimasi selesai: {queueInfo.estimatedDays} Hari (Maksimal)
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Tugas */}
                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-medium text-sm">
                    <Lock className="w-4 h-4" /> Akses Portal Kampus (Aman)
                  </div>
                  <div className="space-y-2">
                    <Label>Link Web Tugas / E-learning</Label>
                    <Input name="taskLink" value={formData.taskLink} onChange={handleChange} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username SSO</Label>
                      <Input name="ssoUsername" value={formData.ssoUsername} onChange={handleChange} placeholder="NIM / Email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password SSO</Label>
                      <Input name="ssoPassword" value={formData.ssoPassword} onChange={handleChange} type="password" placeholder="******" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mata Kuliah</Label>
                      <Input name="mataKuliah" value={formData.mataKuliah} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Judul Tugas</Label>
                      <Input name="judulTugas" value={formData.judulTugas} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Instruksi Khusus</Label>
                    <Textarea name="instruksi" value={formData.instruksi} onChange={handleChange} className="min-h-[100px]" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-blue-900">Total: Rp 10.000</p>
                        <p className="text-blue-700">Akan diarahkan ke aplikasi DANA (Simulasi).</p>
                    </div>
                </div>

              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep} disabled={isLoading}>Kembali</Button>
                
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proses...
                    </>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}