"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Fungsi untuk update status (misal: dari PAID -> COMPLETED)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();
  
  // Security: Pastikan yang akses adalah ADMIN
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { error: "Gagal update status" };
  }
}