import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-canvas text-white"
        suppressHydrationWarning
      >
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L06ZYTS899"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L06ZYTS899');
          `}
        </Script>
      </body>
    </html>
  );
}
