import { NextAuthOptions, getServerSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter"; 
import { db } from "@/lib/db";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Memaksa Google mengirim refresh token agar sesi tidak cepat habis
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    // Error page bisa diarahkan ke login juga untuk simplicity
    error: "/login", 
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);