import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntentCart - Shop Smarter, Faster",
  description: "Enterprise-grade AI shopping platform inspired for Amazon's speed and reliability.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-amazon-background-light dark:bg-amazon-background-dark text-amazon-text-primary-light dark:text-amazon-text-primary-dark transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
