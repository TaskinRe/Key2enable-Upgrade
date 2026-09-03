import jsPDF from "jspdf";
import amiriFont from "./Amiri-Regular.js";
import { decodeHtml } from "./decodeHTML.js";

export function downloadReportPDF(studentName, month, englishReport, arabicReport) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait"
  });

  // Register Amiri font
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

  // English: Helvetica
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`${studentName} - ${month} Progress Report`, 20, 20);

  doc.setFontSize(12);
  const engLines = doc.splitTextToSize(englishReport, 170);
  doc.text(engLines, 20, 30);

  // Add some space before Arabic
  let yPos = 30 + engLines.length * 6 + 10;

  // Arabic: Right aligned
  const cleanArabic = decodeHtml(arabicReport);

  doc.setFont("Amiri");
  doc.setFontSize(14);
  doc.text("Arabic Version:", 190, yPos, { align: "right" });
  yPos += 10;

  doc.setFontSize(12);

  const arabicLines = cleanArabic.split("\n");

  arabicLines.forEach((line) => {
    doc.text(line.trim(), 190, yPos, {
      align: "right",
      maxWidth: 170
    });
    yPos += 8; // spacing for Arabic lines
  });

  doc.save(`${studentName}_${month}_Report.pdf`);
}
