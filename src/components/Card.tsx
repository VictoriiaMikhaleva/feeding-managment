import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-amber-100 bg-white shadow-sm shadow-amber-100/50",
        paddingMap[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
