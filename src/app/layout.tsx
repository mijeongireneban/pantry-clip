import "@/src/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Merriweather, Outfit } from "next/font/google";
import localFont from "next/font/local";

import { AppProvider } from "@/src/apps/app/app.provider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif"
});
const googleSansMono = localFont({
  src: [
    { path: "../styles/fonts/Google-Sans-Mono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../styles/fonts/Google-Sans-Mono-Medium.ttf", weight: "500", style: "normal" },
    { path: "../styles/fonts/Google-Sans-Mono-Bold.ttf", weight: "700", style: "normal" },
    { path: "../styles/fonts/Google-Sans-Mono-Italic.ttf", weight: "400", style: "italic" }
  ],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "PantryClip",
  description: "Turn short-video recipes into structured cooking notes"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`dark ${outfit.variable} ${merriweather.variable} ${googleSansMono.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
