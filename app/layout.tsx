import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "IntentCart - Shop Smarter, Faster",
  description: "Enterprise-grade AI shopping platform inspired for Amazon's speed and reliability.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} ${sora.variable} font-sans min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
