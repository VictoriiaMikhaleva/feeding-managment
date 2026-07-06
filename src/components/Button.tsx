import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-200",
  secondary:
    "bg-orange-100 text-amber-900 hover:bg-orange-200",
  outline:
    "border-2 border-amber-300 text-amber-800 hover:bg-amber-50",
  ghost: "text-amber-800 hover:bg-amber-50",
};

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
