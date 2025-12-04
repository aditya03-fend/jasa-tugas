"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function confirmPayment(orderId: string) {
  // Update status menjadi PAID
  await db.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentProof: "DANA-SIMULATION-" + Math.floor(Math.random() * 100000), // ID Transaksi palsu
    },
  });

  // Refresh data
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getOrderDetails(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });
  return order;
}

// Hitung antrean (Untuk fitur "Selesai dalam 1 hari")
export async function getQueuePosition(orderId: string) {
  const targetOrder = await db.order.findUnique({ where: { id: orderId } });
  if (!targetOrder) return 0;

  // Hitung berapa order yang statusnya PAID/PROCESSED yang dibuat SEBELUM order ini
  const count = await db.order.count({
    where: {
      status: { in: ["PAID", "PROCESSED"] },
      createdAt: { lt: targetOrder.createdAt },
    },
  });
  
  // Antrean = jumlah order sebelumnya + 1
  return count + 1;
}