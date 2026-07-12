"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Result page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="mb-2 text-lg font-semibold text-amber-950">
        Не удалось показать меню
      </p>
      <p className="mb-6 text-sm text-amber-800">
        Попробуйте обновить страницу или сгенерировать меню заново.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Обновить</Button>
        <Link href="/form">
          <Button variant="outline">Составить меню</Button>
        </Link>
      </div>
    </div>
  );
}
