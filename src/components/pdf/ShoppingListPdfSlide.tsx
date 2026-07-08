import type { CSSProperties } from "react";
import type { ShoppingListCategory } from "@/lib/types";

const pageStyle: CSSProperties = {
  width: 794,
  minHeight: 1123,
  backgroundColor: "#FAF7F2",
  fontFamily: "'Segoe UI', 'Noto Sans', system-ui, sans-serif",
  color: "#2b2f3a",
  padding: "48px 40px",
  boxSizing: "border-box",
};

interface ShoppingListPdfSlideProps {
  categories: ShoppingListCategory[];
  days: number;
}

export function ShoppingListPdfSlide({
  categories,
  days,
}: ShoppingListPdfSlideProps) {
  const total = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div style={pageStyle} data-pdf-page>
      <header style={{ marginBottom: 32, textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8B7355",
            fontWeight: 600,
          }}
        >
          Семейное меню
        </p>
        <h1
          style={{
            margin: "8px 0 6px",
            fontSize: 28,
            fontWeight: 700,
            color: "#3D3229",
          }}
        >
          Список покупок
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#8B7D6E" }}>
          На {days} {days === 1 ? "день" : days < 5 ? "дня" : "дней"} · {total}{" "}
          позиций
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map((cat) => (
          <section
            key={cat.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              padding: "16px 18px",
              border: "1px solid #EDE6DC",
              boxShadow: "0 2px 12px rgba(61, 50, 41, 0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 16,
                fontWeight: 700,
                color: "#5C6B4F",
              }}
            >
              {cat.title}
            </h2>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {cat.items.map((item) => (
                <li
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 13,
                    lineHeight: 1.4,
                    borderBottom: "1px solid #F5F0E8",
                    paddingBottom: 4,
                  }}
                >
                  <span style={{ color: "#3D3229" }}>☐ {item.name}</span>
                  {item.amount && (
                    <span
                      style={{
                        color: "#8B7D6E",
                        fontSize: 11,
                        textAlign: "right",
                        flexShrink: 0,
                        maxWidth: "45%",
                      }}
                    >
                      {item.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 9,
          color: "#B5A898",
        }}
      >
        Список сформирован автоматически. Проверьте количество перед покупкой.
      </p>
    </div>
  );
}
