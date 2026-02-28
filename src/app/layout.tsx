import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universe Events API Sandbox",
  description: "Explore our immersive event experiences.",
  icons: {
    icon: "/universe_com_logo.jpeg",
    shortcut: "/universe_com_logo.jpeg",
    apple: "/universe_com_logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-[#222222]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
