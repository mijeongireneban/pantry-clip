import type { Metadata } from "next";
import { AppProvider } from "@/src/apps/app/app.provider";
import "@/src/styles/globals.css";

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
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
