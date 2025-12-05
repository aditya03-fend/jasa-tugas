"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Callback URL akan mengarahkan user ke dashboard setelah sukses login/daftar
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Login Failed", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <Card className="w-full max-w-sm shadow-xl border-zinc-200">
        <CardHeader className="text-center space-y-2">
          {/* Logo Sederhana */}
          <div className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-serif italic text-2xl mb-2">
            J
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Selamat Datang</CardTitle>
          <CardDescription>
            Masuk atau daftar otomatis menggunakan akun Google Anda untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4 pb-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12 gap-3 text-base font-medium relative overflow-hidden transition-all hover:bg-zinc-50 hover:border-zinc-400" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : (
              <>
                <FcGoogle className="w-6 h-6" /> 
                <span>Lanjut dengan Google</span>
              </>
            )}
          </Button>

          <p className="text-center text-xs text-zinc-400 px-4">
            Dengan melanjutkan, Anda menyetujui persyaratan layanan JasaTugas.id
          </p>
        </CardContent>
      </Card>
    </div>
  );
}