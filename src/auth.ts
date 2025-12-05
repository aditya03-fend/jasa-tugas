import { NextAuthOptions, getServerSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter"; 
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // UBAH DARI 'email' KE 'identifier' AGAR BISA BACA USERNAME JUGA
        identifier: { label: "Username/Email", type: "text" }, 
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Cek apakah data dikirim
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        // CARI USER BERDASARKAN EMAIL **ATAU** USERNAME
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Cek Password
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
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