import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "IntentCart — Shop Smarter, Faster",
  description:
    "AI-powered grocery cart builder for Amazon Now. Describe what you need, get a cart in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} ${sora.variable} font-sans min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
