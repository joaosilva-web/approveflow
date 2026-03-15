import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApproveFlow — File Approvals Without the Chaos",
  description:
    "Send files to clients and get structured approvals. No WhatsApp threads, no confusing email chains. Just clean, trackable reviews with a single link.",
  keywords: [
    "file approval",
    "client review",
    "freelancer tool",
    "design approval",
    "document approval",
  ],
  openGraph: {
    title: "ApproveFlow — File Approvals Without the Chaos",
    description:
      "Send files to clients and get structured approvals without the chaos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-canvas text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
