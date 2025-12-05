import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CompleteProfileForm from "./form"; // Kita pisah ke client component

export default async function CompleteProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Jika sudah punya username, tidak perlu ke sini lagi
  if ((session.user as any).username) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <CompleteProfileForm userId={(session.user as any).id} />
    </div>
  );
}