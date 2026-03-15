import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — no Prisma, no Node.js-only imports.
 * Used by proxy.ts (Edge runtime) to protect routes via JWT.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (nextUrl.pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [], // providers are added in auth.ts
} satisfies NextAuthConfig;
