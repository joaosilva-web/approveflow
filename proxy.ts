import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: uses JWT-only config with no Prisma/Node.js native modules.
const { auth } = NextAuth(authConfig);
export const proxy = auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
