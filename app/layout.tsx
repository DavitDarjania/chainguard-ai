import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainGuard AI",
  description: "AI-powered crypto scam detection for wallets, tokens, and smart contracts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="scanline-overlay font-mono antialiased">{children}</body>
    </html>
  );
}
