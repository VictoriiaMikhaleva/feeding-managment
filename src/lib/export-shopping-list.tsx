import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ShoppingListPdfSlide } from "@/components/pdf/ShoppingListPdfSlide";
import type { GeneratedMealPlan } from "./types";
import { formatShoppingListForCopy } from "./shopping-list";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadShoppingListTxt(
  plan: GeneratedMealPlan,
  checked?: Set<string>,
): void {
  const header = [
    "СПИСОК ПОКУПОК",
    `Меню на ${plan.profile.days} дн.`,
    `Дата: ${new Date().toLocaleDateString("ru-RU")}`,
    "",
  ].join("\n");

  const body = formatShoppingListForCopy(plan.shoppingList, checked);
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/plain;charset=utf-8",
  });

  downloadBlob(
    blob,
    `pokupki-${plan.profile.days}-dney-${new Date().toISOString().slice(0, 10)}.txt`,
  );
}

async function renderShoppingListCanvas(plan: GeneratedMealPlan) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    root.render(
      <ShoppingListPdfSlide
        categories={plan.shoppingList}
        days={plan.profile.days}
      />,
    );
    await new Promise((r) => setTimeout(r, 80));
    await document.fonts.ready;

    const slide = host.querySelector("[data-pdf-page]") as HTMLElement;
    if (!slide) throw new Error("Shopping list PDF slide not rendered");

    return html2canvas(slide, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FAF7F2",
      logging: false,
      height: slide.scrollHeight,
      windowHeight: slide.scrollHeight,
    });
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

export async function downloadShoppingListPdf(
  plan: GeneratedMealPlan,
): Promise<void> {
  const canvas = await renderShoppingListCanvas(plan);
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [794, Math.max(1123, canvas.height / 2)],
    compress: true,
  });

  const pageWidth = 794;
  const pageHeight = Math.max(1123, canvas.height / 2);
  pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

  const blob = pdf.output("blob");
  downloadBlob(
    blob,
    `pokupki-${plan.profile.days}-dney-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
