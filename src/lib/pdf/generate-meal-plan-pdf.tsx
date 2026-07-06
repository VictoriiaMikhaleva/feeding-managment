import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { GeneratedMealPlan } from "@/lib/types";
import { DayMenuPdfSlide } from "@/components/pdf/DayMenuPdfSlide";

async function renderDayToCanvas(day: GeneratedMealPlan["days"][0]) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    root.render(<DayMenuPdfSlide day={day} />);
    await new Promise((r) => setTimeout(r, 80));
    await document.fonts.ready;

    const slide = host.querySelector("[data-pdf-page]") as HTMLElement;
    if (!slide) throw new Error("PDF slide not rendered");

    const canvas = await html2canvas(slide, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FAF7F2",
      logging: false,
    });

    return canvas;
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

export async function generateMealPlanPdf(
  plan: GeneratedMealPlan,
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1123, 794],
    compress: true,
  });

  for (let i = 0; i < plan.days.length; i++) {
    const canvas = await renderDayToCanvas(plan.days[i]);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (i > 0) pdf.addPage([1123, 794], "landscape");
    pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);
  }

  return pdf.output("blob");
}

export async function downloadMealPlanPdf(
  plan: GeneratedMealPlan,
  filename?: string,
): Promise<void> {
  const blob = await generateMealPlanPdf(plan);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ??
    `menu-${plan.profile.days}-dney-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
