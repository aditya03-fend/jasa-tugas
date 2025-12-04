"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment } from "@/actions/payment";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("PIN");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (pin.length === 6) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep("CONFIRM"); }, 1000);
    }
  }, [pin]);

  const handlePay = async () => {
    setLoading(true);
    await confirmPayment(id);
    setTimeout(() => {
      setLoading(false);
      setStep("SUCCESS");
      setTimeout(() => { router.push(`/dashboard/status/${id}?success=true`); }, 2000);
    }, 1500);
  };

  if (!id) return null;

  return (
    <div className="min-h-screen bg-[#118EEA] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-sm bg-[#118EEA] flex flex-col items-center">
        <div className="mb-8 text-center"><h1 className="text-2xl font-bold tracking-tight">DANA</h1><p className="text-blue-100 text-sm">Dompet Digital Indonesia</p></div>
        {step === "PIN" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="bg-white rounded-t-3xl p-6 pb-12 w-full text-center text-zinc-800 shadow-2xl">
              <p className="font-semibold mt-4 mb-8">Masukkan PIN DANA Anda</p>
              <div className="flex justify-center gap-4 mb-8">{[...Array(6)].map((_, i) => <div key={i} className={`w-4 h-4 rounded-full border border-zinc-300 ${i < pin.length ? "bg-[#118EEA]" : "bg-white"}`} />)}</div>
              <div className="grid grid-cols-3 gap-6 max-w-[240px] mx-auto font-bold text-xl">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => <button key={num} onClick={() => setPin(p => p.length < 6 ? p + num : p)} className="hover:bg-zinc-100 py-2 rounded-full transition">{num}</button>)}<div /><button onClick={() => setPin(p => p.length < 6 ? p + "0" : p)} className="hover:bg-zinc-100 py-2 rounded-full transition">0</button><button onClick={() => setPin(p => p.slice(0, -1))} className="text-sm font-normal text-red-500 py-2">Hapus</button></div>
            </div>
          </motion.div>
        )}
        {step === "CONFIRM" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl p-6 text-zinc-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4"><span className="text-zinc-500 text-sm">Total Pembayaran</span><span className="font-bold text-lg">Rp 10.000</span></div>
            <div className="flex items-center justify-between mb-8"><span className="text-zinc-500 text-sm">Ke Merchant</span><span className="font-semibold">JasaTugas.id</span></div>
            <button onClick={handlePay} disabled={loading} className="w-full bg-[#118EEA] hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin w-5 h-5" /> : "BAYAR SEKARANG"}</button>
          </motion.div>
        )}
        {step === "SUCCESS" && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-full p-6"><ShieldCheck className="w-16 h-16 text-green-500" /></motion.div>}
      </div>
    </div>
  );
}