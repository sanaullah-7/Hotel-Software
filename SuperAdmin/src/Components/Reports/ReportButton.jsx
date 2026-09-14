import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportData.js';

export default function ReportButton({ data = [], filename = 'report.csv', label = 'Export CSV' }) {
  const handleExport = () => {
    if (!data.length) return;
    exportToCSV(data, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      className="btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 8,
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        cursor: data.length ? 'pointer' : 'not-allowed',
        opacity: data.length ? 1 : 0.5,
      }}
    >
      <Download size={14} />
      <span>{label}</span>
    </button>
  );
}
