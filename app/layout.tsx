import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import localfont from "next/font/local";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import BottomNav from "@/components/blocks/bottom-nav";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";
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
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PQGRKC83');`}
        </Script>
      </head>
      <body className={`${geistSans.className} ${satoshi.variable} antialiased flex flex-col items-center`}>
        
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PQGRKC83"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

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
        <Analytics/> 
      </body>
    </html>
  );
}
