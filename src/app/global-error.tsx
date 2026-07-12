"use client";

import { useEffect } from "react";
import { appPath } from "@/lib/app-path";

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
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "#fffbf5",
          color: "#451a03",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
          Не удалось загрузить страницу
        </p>
        <p style={{ fontSize: "14px", maxWidth: "420px", marginBottom: "24px" }}>
          Попробуйте обновить страницу. Если ошибка повторяется — откройте
          сайт заново через главную.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#ea580c",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Обновить
          </button>
          <button
            type="button"
            onClick={() => window.location.assign(appPath("/"))}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "2px solid #fcd34d",
              background: "white",
              color: "#92400e",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            На главную
          </button>
        </div>
      </body>
    </html>
  );
}
