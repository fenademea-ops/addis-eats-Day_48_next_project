/**
 * CSV generation and client-side download utility (Day 47)
 * Implements RFC 4180 compliant escaping.
 */

/**
 * Escapes a single CSV field value according to RFC 4180:
 * If the value contains a comma, double-quote, or newline,
 * enclose the entire value in double-quotes and escape internal double-quotes by doubling them ("").
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }

  const str = String(val);

  // If value contains a double-quote, comma, or newline (CR or LF)
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts an array of objects into RFC-4180 compliant CSV string.
 * Uses object keys of the first row as the header row if no explicit columns provided.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (!rows || rows.length === 0) {
    if (headers && headers.length > 0) {
      return headers.map((h) => escapeCsvField(h.label)).join(",") + "\r\n";
    }
    return "";
  }

  const cols =
    headers ||
    Object.keys(rows[0]).map((key) => ({
      key: key as keyof T,
      label: key,
    }));

  const headerLine = cols.map((col) => escapeCsvField(col.label)).join(",");
  const dataLines = rows.map((row) =>
    cols.map((col) => escapeCsvField(row[col.key])).join(",")
  );

  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * Triggers a browser download of a CSV file using Blob and object URL.
 * Automatically cleans up the object URL after triggering.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  anchor.click();

  // Clean up safely
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}
