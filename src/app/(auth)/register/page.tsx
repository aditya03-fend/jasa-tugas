"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Panggil Server Action registerUser
    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Sukses -> Alert & Redirect ke Login
      alert("Pendaftaran Berhasil! Silakan login.");
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Daftar Akun Baru</CardTitle>
          <CardDescription>
            Gabung sekarang untuk mulai joki tugas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Tombol Google */}
          <Button 
            variant="outline" 
            className="w-full h-11 gap-2 mb-4" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <FcGoogle className="w-5 h-5" /> Daftar dengan Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">Atau daftar manual</span>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 text-center">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input name="username" placeholder="jagoan_kampus" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" placeholder="nama@email.com" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="******" 
                  onChange={handleChange} 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-500">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button className="w-full bg-zinc-900 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="text-center text-sm mt-4">
            Sudah punya akun? <Link href="/login" className="underline font-bold">Login</Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}