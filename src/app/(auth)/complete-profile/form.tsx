"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfile } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CompleteProfileForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await completeProfile(userId, formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Satu Langkah Lagi!</CardTitle>
        <CardDescription>Silakan buat Username dan Password untuk akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Buat Username</Label>
            <Input name="username" required placeholder="username_unik" />
          </div>
          <div className="space-y-2">
            <Label>Buat Password</Label>
            <Input name="password" type="password" required placeholder="******" />
          </div>
          <Button className="w-full" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan & Lanjut"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
