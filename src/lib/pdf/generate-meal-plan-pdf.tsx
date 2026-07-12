import { createRoot } from "react-dom/client";
import { DayMenuPdfSlide } from "@/components/pdf/DayMenuPdfSlide";
import type { GeneratedMealPlan } from "@/lib/types";

async function loadPdfLibs() {
  const [html2canvasModule, jspdfModule] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  return {
    html2canvas: html2canvasModule.default,
    jsPDF: jspdfModule.jsPDF,
  };
}

function buildPdfPlan(
  plan: GeneratedMealPlan,
  selectedMealKeys?: Set<string>,
): GeneratedMealPlan {
  if (!selectedMealKeys) return plan;

  const days = plan.days
    .map((day) => ({
      ...day,
      meals: day.meals.filter((meal) =>
        selectedMealKeys.has(`${day.day}-${meal.mealType}`),
      ),
    }))
    .filter((day) => day.meals.length > 0);

  return { ...plan, days };
}

async function renderDayToCanvas(day: GeneratedMealPlan["days"][0]) {
  const { html2canvas } = await loadPdfLibs();

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
  selectedMealKeys?: Set<string>,
): Promise<Blob> {
  const { jsPDF } = await loadPdfLibs();
  const pdfPlan = buildPdfPlan(plan, selectedMealKeys);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1123, 794],
    compress: true,
  });

  for (let i = 0; i < pdfPlan.days.length; i++) {
    const canvas = await renderDayToCanvas(pdfPlan.days[i]);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (i > 0) pdf.addPage([1123, 794], "landscape");
    pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);
  }

  return pdf.output("blob");
}

export async function downloadMealPlanPdf(
  plan: GeneratedMealPlan,
  selectedMealKeys?: Set<string>,
  filename?: string,
): Promise<void> {
  const blob = await generateMealPlanPdf(plan, selectedMealKeys);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename ??
    `menu-${plan.profile.days}-dney-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
