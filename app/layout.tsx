import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";

export const metadata: Metadata = {
  title: "Amazon-Intent - Shop Smarter with AI",
  description: "AI-powered shopping that understands your needs. Speak, type, or scan - we deliver in 30 minutes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#131A22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('app_theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-[#0F1111]">
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
