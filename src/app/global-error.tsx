"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#fffbf5] px-4 text-center">
        <p className="mb-2 text-lg font-semibold text-amber-950">
          Не удалось загрузить страницу
        </p>
        <p className="mb-6 max-w-md text-sm text-amber-800">
          Попробуйте обновить страницу. Если ошибка повторяется — откройте сайт
          заново через главную.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>Обновить</Button>
          <Link href="/">
            <Button variant="outline">На главную</Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
