import ExcelJS from 'exceljs';

export async function loadWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

export function worksheetPrimitive(
  worksheet: ExcelJS.Worksheet,
  address: string,
): string | number | Date | undefined {
  const raw = worksheet.getCell(address).value;
  if (raw == null) return undefined;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'object' && 'result' in raw) {
    const result = (raw as ExcelJS.CellFormulaValue).result;
    if (result instanceof Date) return result;
    if (typeof result === 'string' || typeof result === 'number') return result;
    if (result == null) return undefined;
    return String(result);
  }
  if (typeof raw === 'object' && 'text' in raw) {
    const text = (raw as ExcelJS.CellHyperlinkValue).text;
    return typeof text === 'string' ? text : String(text ?? '');
  }
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (typeof raw === 'object' && 'richText' in raw) {
    return (raw as ExcelJS.CellRichTextValue).richText.map((part) => part.text).join('');
  }
  return String(raw);
}

export function worksheetFormula(worksheet: ExcelJS.Worksheet, address: string): string | undefined {
  const formula = worksheet.getCell(address).formula;
  return typeof formula === 'string' ? formula : undefined;
}

export function worksheetHyperlink(worksheet: ExcelJS.Worksheet, address: string): string | undefined {
  const raw = worksheet.getCell(address).value;
  if (raw && typeof raw === 'object' && 'hyperlink' in raw) {
    const link = (raw as ExcelJS.CellHyperlinkValue).hyperlink;
    if (typeof link === 'string') return link;
    if (link && typeof link === 'object' && 'text' in link) return link.text;
  }
  return undefined;
}

/** Excel 1900 date serial (days since 1899-12-30). */
export function parseExcelSerialDate(serial: number): { y: number; m: number; d: number } | null {
  if (typeof serial !== 'number' || !Number.isFinite(serial) || serial < 1) return null;
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
  };
}

export function worksheetUsedRowCount(worksheet: ExcelJS.Worksheet): number {
  return worksheet.rowCount;
}

export async function worksheetRowsAsArrays(worksheet: ExcelJS.Worksheet): Promise<unknown[][]> {
  const rows: unknown[][] = [];
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const values = [...row.values];
    values.shift();
    rows.push(values.map((cell) => (cell == null ? '' : cell)));
  });
  return rows;
}