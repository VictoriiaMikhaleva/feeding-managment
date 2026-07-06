import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-amber-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🍽️
          </span>
          <span className="text-lg font-semibold text-amber-900">
            Семейное меню
          </span>
        </Link>
        <nav className="flex gap-3 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-amber-800 hover:bg-amber-50"
          >
            Главная
          </Link>
          <Link
            href="/form"
            className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
          >
            Составить меню
          </Link>
        </nav>
      </div>
    </header>
  );
}
