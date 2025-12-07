"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache"; // Penting untuk refresh halaman

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
        status: data.status || "PENDING", 
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

// --- FUNGSI BARU: RETRY PAYMENT ---
export async function retryPayment(orderId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    // Update status kembali ke PAID agar masuk antrean admin lagi
    await db.order.update({
      where: { 
        id: orderId,
        userId: (session.user as any).id // Pastikan pemilik order
      },
      data: { 
        status: "PAID",
        updatedAt: new Date() // Refresh timestamp
      }
    });
    
    // Refresh halaman terkait
    revalidatePath(`/dashboard/status/${orderId}`);
    revalidatePath(`/dashboard`);
    
    return { success: true };
  } catch (error) {
    return { error: "Gagal update status." };
  }
}