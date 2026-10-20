// CSV that Excel opens correctly: UTF-8 BOM, quoted cells, CRLF lines. Cells that start with
// = + - @ are prefixed with ' so a spreadsheet never runs them as formulas (CSV injection).
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function toCsv(header: string[], rows: string[][]): string {
  return '﻿' + [header, ...rows].map((r) => r.map((v) => cell(String(v ?? ''))).join(',')).join('\r\n') + '\r\n';
}
