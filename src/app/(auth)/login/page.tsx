"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react"; // v4 client import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/actions/auth"; 

export default function AuthPage() {
  const [variant, setVariant] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVariant = () => {
    setVariant((prev) => (prev === "LOGIN" ? "REGISTER" : "LOGIN"));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (variant === "REGISTER") {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        setError(null);
        alert("Pendaftaran berhasil! Silakan login.");
        setVariant("LOGIN");
        setIsLoading(false);
      }
    } else {
      // Login NextAuth v4
      const res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setError("Email atau password salah");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
    <Card className="w-full max-w-md border-zinc-200 shadow-xl overflow-hidden relative">
      <CardHeader className="text-center pb-2">
        <motion.div key={variant} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <CardTitle className="text-2xl font-bold tracking-tight">
            {variant === "LOGIN" ? "Selamat Datang" : "Buat Akun Baru"}
            </CardTitle>
            <CardDescription>
            {variant === "LOGIN" ? "Masuk untuk mengelola tugas kuliahmu." : "Daftar dalam hitungan detik."}
            </CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full h-11 gap-2 bg-zinc-50" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <FcGoogle className="w-5 h-5" />
            {variant === "LOGIN" ? "Masuk dengan Google" : "Daftar dengan Google"}
        </Button>

        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Atau gunakan email</span></div></div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
             <motion.div key={variant} initial={{ opacity: 0, x: variant === "LOGIN" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: variant === "LOGIN" ? 20 : -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required disabled={isLoading} /></div>
                <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" required disabled={isLoading} /></div>
             </motion.div>
          </AnimatePresence>
          <Button className="w-full bg-zinc-900 text-white" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{variant === "LOGIN" ? "Masuk Sekarang" : "Daftar Akun"}</Button>
        </form>

        <div className="text-center text-sm text-zinc-500 mt-4">
          {variant === "LOGIN" ? "Belum punya akun? " : "Sudah punya akun? "}
          <span onClick={toggleVariant} className="underline cursor-pointer text-zinc-900 font-semibold">{variant === "LOGIN" ? "Daftar di sini" : "Login di sini"}</span>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}