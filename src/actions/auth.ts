"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function registerUser(formData: FormData) {
  // 1. Ambil data dari FormData
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // Ambil nama dari bagian depan email (contoh: budi@gmail.com -> budi)
  const name = email.split("@")[0];

  // 2. Validasi sederhana
  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  try {
    // 3. Cek apakah email sudah terdaftar
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar, silakan login." };
    }

    // 4. Hash password (Enkripsi)
    const hashedPassword = await hash(password, 10);

    // 5. Simpan ke Database
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER", // Default role
      },
    });

    return { success: true };
    
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}