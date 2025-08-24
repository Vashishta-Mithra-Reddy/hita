import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import localfont from "next/font/local";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import BottomNav from "@/components/blocks/bottom-nav";
// import RadialGradient from "@/components/RadialGradient";
// import BottomGradient from "@/components/BottomGradient";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Hita | Your Well Wisher",
  description: "Hita is an AI-powered wellness platform to find clean, healthy products, remedies, and nutritional information. Powered by RAG and embeddings for accurate, context-aware answers.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const satoshi = localfont({
  variable: "--font-satoshi",
  weight: "900",
  src: "./fonts/Satoshi-Variable.woff2",
  display: "swap"
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${satoshi.variable} antialiased flex flex-col items-center`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Toaster/>
          <Header />
          <div>
            {children}
          </div>
          {/* <RadialGradient/> */}
          {/* <BottomGradient/> */}
          <BottomNav/>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
