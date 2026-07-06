import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Семейное меню на неделю",
  description:
    "Составьте бюджетное семейное меню с учётом вкусов взрослых и детей",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#fffbf5]">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-amber-100 py-4 text-center text-xs text-amber-700/50">
          Семейное меню · MVP
        </footer>
      </body>
    </html>
  );
}
