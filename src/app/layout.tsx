import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFCraft | Free PDF Tools",
  description: "Merge, split, compress, and edit PDFs 100% free and client-side.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} font-sans antialiased text-foreground bg-background`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
