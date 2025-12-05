"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";

// REGISTER SEDERHANA: Langsung simpan ke database
export async function registerUser(formData: any) {
  const { username, email, password } = formData;

  // 1. Validasi Input
  if (!username || !email || !password) {
    return { error: "Semua field wajib diisi" };
  }

  try {
    // 2. Cek apakah Username atau Email sudah dipakai
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return { error: "Email atau Username sudah digunakan orang lain" };
    }

    // 3. Hash Password
    const hashedPassword = await hash(password, 10);

    // 4. Buat User Baru
    await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: username, // Default nama pakai username
        role: "USER"
      }
    });

    return { success: true };
    
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }
}

// Fungsi completeProfile tetap dibutuhkan jika user Google ingin set password nanti
export async function completeProfile(userId: string, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if(!username || !password) return { error: "Data tidak lengkap" };

  const exist = await db.user.findUnique({ where: { username } });
  if (exist) return { error: "Username sudah dipakai" };

  const hashedPassword = await hash(password, 10);

  await db.user.update({
    where: { id: userId },
    data: { username, password: hashedPassword }
  });

  return { success: true };
}