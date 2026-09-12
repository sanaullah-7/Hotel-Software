/**
 * Export an array of objects to a CSV file download.
 * @param {object[]} data
 * @param {string} filename
 * @param {string[]} [columns] - Optional column order; defaults to all keys.
 */
export function exportToCSV(data, filename = 'export.csv', columns) {
  if (!data || data.length === 0) return;

  const keys = columns || Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map((row) =>
    keys
      .map((k) => {
        const val = row[k] ?? '';
        // Escape commas and quotes
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data as a JSON file download.
 * @param {object|object[]} data
 * @param {string} filename
 */
export function exportToJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
