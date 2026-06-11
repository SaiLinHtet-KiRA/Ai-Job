import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { isUserBanned } from "@/lib/user-profile";
import { sendWelcomeEmail } from "@/lib/email";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = supabaseAdmin();

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("banned") || msg.includes("disabled")) {
            throw new Error("Your account has been banned.");
          }
          return null;
        }

        if (!data.user) return null;

        const banned = await isUserBanned(data.user.id);
        if (banned) {
          throw new Error("Your account has been banned.");
        }

        return {
          id: data.user.id,
          email: data.user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        sendWelcomeEmail(user.email, user.name ?? undefined).catch((err) =>
          console.error("sendWelcomeEmail failed (OAuth):", err)
        );
      }
    },
  },
};

export default NextAuth(authOptions);
