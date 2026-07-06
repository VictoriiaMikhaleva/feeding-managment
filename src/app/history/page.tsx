import { HistoryList } from "@/components/HistoryList";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-amber-950">История меню</h1>
      <p className="mb-6 text-amber-800/70">
        Все сохранённые меню. Можно открыть, скачать PDF или удалить запись.
      </p>
      <HistoryList />
    </div>
  );
}
