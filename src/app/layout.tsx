import type { Metadata } from "next";
import { Rubik, Space_Grotesk } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auction House",
  description: "A clean, modern auction marketplace.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
