import NextAuth from "next-auth";
import { authOptions } from "@/auth"; // Import konfigurasi authOptions yang sudah kita buat

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };