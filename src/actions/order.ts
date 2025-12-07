"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function createOrder(data: any) {
  const session = await auth();
  if (!session || !session.user || !(session.user as any).id) {
    return { error: "Anda harus login terlebih dahulu untuk memesan." };
  }

  // Validasi: Jika DRAFT, validasi bisa lebih longgar (opsional)
  // Tapi untuk simpelnya, kita minta data minimal tetap terisi
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
        
        // REVISI: Field 'instruksi' kita gunakan untuk menyimpan 'Jawaban'
        instruksi: data.instruksi || "", 
        
        // Status dinamis (bisa DRAFT atau PENDING/PAID)
        status: data.status || "PENDING", 
        
        // Simpan harga (termasuk kode unik jika ada)
        price: data.price || 10000,
        
        paymentProof: data.status === "PAID" ? "TEST-AUTO-PAYMENT" : null,
      },
    });

    return { success: true, orderId: newOrder.id };

  } catch (error) {
    console.error("Gagal membuat order:", error);
    return { error: "Gagal menyimpan order. Silakan coba lagi nanti." };
  }
}

export async function getQueueInfo() {
  try {
    const activeCount = await db.order.count({
      where: { status: { in: ["PAID", "PROCESSED"] } }
    });
    const nextQueueNumber = activeCount + 1;
    const estimatedDays = Math.ceil(nextQueueNumber / 20);
    return { nextQueueNumber, estimatedDays };
  } catch (error) {
    return { nextQueueNumber: 1, estimatedDays: 1 };
  }
}