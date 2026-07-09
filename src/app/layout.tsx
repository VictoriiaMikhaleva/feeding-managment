import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Header } from "@/components/Header";
import { StorageBootstrap } from "@/components/StorageBootstrap";
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
      <body className="flex min-h-full flex-col">
        <StorageBootstrap />
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-amber-100 py-4 text-center text-xs text-amber-700/50">
          <p>Семейное меню · MVP</p>
          <p className="mt-1">
            Создано Викторией Михалевой · контент, ИИ и цифровые проекты ·
            {" "}
            <a
              href="https://content-system.ru"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-amber-300/80 underline-offset-2 hover:text-amber-800"
            >
              content-system.ru
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
