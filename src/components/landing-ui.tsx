"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Menerima props 'user' dari server component (page.tsx)
export default function LandingUI({ user }: { user: any }) {
  // Konfigurasi animasi sederhana
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="bg-white text-zinc-900 selection:bg-black selection:text-white">
      
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Badge Online */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online & Siap Mengerjakan
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Tugas Kuliah Selesai,<br />
            <span className="text-zinc-400">Nilai Aman Terkendali.</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p variants={fadeInUp} className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Layanan bantuan tugas akademik profesional untuk mahasiswa. 
            Mulai dari <strong>Rp 10.000</strong>. Privasi aman, pengerjaan cepat, bebas pusing.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            {user ? (
              // --- KONDISI: SUDAH LOGIN (User melihat 2 opsi) ---
              <>
                <Link href="/order" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                    Buat Pesanan Baru <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                   <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900">
                    Lihat Status Pesanan
                  </Button>
                </Link>
              </>
            ) : (
              // --- KONDISI: BELUM LOGIN (Tamu hanya melihat 1 tombol gabungan) ---
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                  Daftar & Order Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
           
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 bg-zinc-50/50 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kilat 24 Jam</h3>
              <p className="text-zinc-500 leading-relaxed">
                Sistem antrean cerdas. Kami membatasi 20 tugas/hari agar fokus mengerjakan punya kamu secepat kilat.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privasi SSO Aman</h3>
              <p className="text-zinc-500 leading-relaxed">
                Login portal kampus (SSO) dienkripsi. Data kamu hanya dilihat oleh admin saat pengerjaan, lalu dilupakan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flat Rp 10.000</h3>
              <p className="text-zinc-500 leading-relaxed">
                Harga mahasiswa banget. Tidak ada biaya tersembunyi. Bayar pakai DANA, konfirmasi otomatis.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Cara Kerja Simpel</h2>
        <div className="space-y-8 md:space-y-0 md:flex md:items-start md:justify-between relative">
            {/* Garis penghubung (Hidden on mobile) */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-zinc-100 -z-10" />

            <div className="bg-white p-4 relative">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">1</div>
                <h3 className="font-bold text-lg">Input Data</h3>
                <p className="text-sm text-zinc-500 mt-2">Isi detail tugas & data diri</p>
            </div>
            <div className="bg-white p-4 relative">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">2</div>
                <h3 className="font-bold text-lg">Bayar 10k</h3>
                <p className="text-sm text-zinc-500 mt-2">Scan QRIS / Transfer DANA</p>
            </div>
            <div className="bg-white p-4 relative">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white">3</div>
                <h3 className="font-bold text-lg">Tugas Beres</h3>
                <p className="text-sm text-zinc-500 mt-2">Pantau status & terima hasil</p>
            </div>
        </div>
      </section>

    </div>
  );
}