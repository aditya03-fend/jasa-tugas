"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// ... (fungsi createOrder yang lama biarkan tetap ada) ...

export async function createOrder(data: any) {
  const session = await auth();
  if (!session || !session.user || !(session.user as any).id) {
    return { error: "Anda harus login terlebih dahulu untuk memesan." };
  }

  if (!data.taskLink || !data.namaMhs) {
    return { error: "Data tugas tidak lengkap. Harap isi form dengan benar." };
  }

  try {
    const newOrder = await db.order.create({
      data: {
        userId: (session.user as any).id,
        namaMhs: data.namaMhs,
        nim: data.nim,
        universitas: data.universitas,
        prodi: data.prodi,
        semester: data.semester,
        taskLink: data.taskLink,
        ssoUsername: data.ssoUsername || "",
        ssoPassword: data.ssoPassword || "",
        mataKuliah: data.mataKuliah,
        judulTugas: data.judulTugas,
        instruksi: data.instruksi || "",
        status: "PAID", // Bypass pembayaran untuk testing
        paymentProof: "TEST-AUTO-PAYMENT",
        price: 10000,
      },
    });

    return { success: true, orderId: newOrder.id };

  } catch (error) {
    console.error("Gagal membuat order:", error);
    return { error: "Gagal menyimpan order. Silakan coba lagi nanti." };
  }
}

// --- FUNGSI BARU UNTUK CEK ANTREAN ---
export async function getQueueInfo() {
  try {
    // Hitung order yang sedang dikerjakan (PAID atau PROCESSED)
    const activeCount = await db.order.count({
      where: {
        status: { in: ["PAID", "PROCESSED"] }
      }
    });
    
    // Antrean user berikutnya = jumlah aktif + 1 (user itu sendiri)
    const nextQueueNumber = activeCount + 1;
    
    // Estimasi hari: 20 tugas per hari
    // Jika antrean 1-20 -> 1 hari
    // Jika antrean 21-40 -> 2 hari, dst.
    const estimatedDays = Math.ceil(nextQueueNumber / 20);

    return { nextQueueNumber, estimatedDays };
  } catch (error) {
    // Default fallback jika error database
    return { nextQueueNumber: 1, estimatedDays: 1 };
  }
}