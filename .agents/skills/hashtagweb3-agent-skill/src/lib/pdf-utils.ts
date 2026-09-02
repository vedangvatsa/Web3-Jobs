import type jsPDF from 'jspdf';

export interface PdfConfig {
  margin?: number;
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  unit?: 'pt' | 'px' | 'mm' | 'cm' | 'in';
  format?: string | number[];
}

export async function createPdfInstance(config: PdfConfig = {}) {
  const { default: jsPDF } = await import('jspdf');
  const orientation = config.orientation || 'p';
  const unit = config.unit || 'pt';
  const format = config.format || 'a4';
  const doc = new jsPDF(orientation, unit, format);
  const margin = config.margin ?? 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  return { doc, margin, contentWidth, pageWidth, pageHeight };
}

export function addPdfHeading(
  doc: jsPDF,
  title: string,
  margin: number,
  y: number,
  fontSize: number = 18
): number {
  doc.setFontSize(fontSize).setFont('helvetica', 'bold').setTextColor('#111827');
  doc.text(title, margin, y);
  return y + fontSize * 1.5 + 10;
}

export function addPdfShortField(
  doc: jsPDF,
  label: string,
  value: string,
  margin: number,
  contentWidth: number,
  y: number,
  underline: boolean = false
): number {
  doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
  doc.text(label, margin, y);

  const labelWidth = doc.getTextWidth(label);
  const valueX = margin + labelWidth + 8;

  if (value) {
    doc.setFont('helvetica', 'bold').setTextColor('#111827');
    doc.text(value, valueX, y);
  }

  if (underline) {
    doc.setDrawColor(209, 213, 219);
    doc.line(valueX, y + 2, margin + contentWidth, y + 2);
  }

  return y + 25;
}

export function addPdfLineSection(
  doc: jsPDF,
  title: string,
  lines: number,
  margin: number,
  contentWidth: number,
  y: number,
  pageHeight: number
): number {
  if (y > pageHeight - (lines * 20 + 50)) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 12 + 10;

  doc.setDrawColor(229, 231, 235);
  for (let i = 0; i < lines; i++) {
    doc.line(margin, y, margin + contentWidth, y);
    y += 20;
  }

  return y + 10;
}

export function addPdfRatingScale(
  doc: jsPDF,
  title: string,
  maxRating: number,
  margin: number,
  contentWidth: number,
  y: number,
  pageHeight: number,
  subtext?: string
): number {
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 12 + 6;

  if (subtext) {
    doc.setFontSize(9).setFont('helvetica', 'italic').setTextColor('#6b7280');
    const subtextLines = doc.splitTextToSize(subtext, contentWidth);
    doc.text(subtextLines, margin, y);
    y += subtextLines.length * 10 + 6;
  }

  doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
  let radioX = margin + 10;
  const step = Math.min(35, Math.floor((contentWidth - 20) / maxRating));

  for (let i = 1; i <= maxRating; i++) {
    doc.circle(radioX, y + 4, 4);
    doc.text(String(i), radioX - 2, y + 18);
    radioX += step;
  }

  return y + 35;
}
