"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Inisialisasi router

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      identifier, // Kirim sebagai identifier (bukan email)
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username/Email atau Password salah");
      setIsLoading(false);
    } else {
      // Redirect manual
      router.push("/dashboard"); 
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Selamat Datang Kembali</CardTitle>
          <CardDescription>Masuk untuk mengelola tugas kuliahmu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <Button variant="outline" className="w-full h-11 gap-2" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <FcGoogle className="w-5 h-5" /> Masuk dengan Google
          </Button>

          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Atau login manual</span></div></div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Username atau Email</Label>
              <Input name="identifier" placeholder="user123 atau user@email.com" required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-500">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full bg-zinc-900 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Masuk"}
            </Button>
          </form>

          <div className="text-center text-sm mt-4">
            Belum punya akun? <Link href="/register" className="underline font-bold">Daftar sekarang</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}