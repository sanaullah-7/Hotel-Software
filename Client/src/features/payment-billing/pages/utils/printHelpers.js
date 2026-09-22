// Print Utilities for Payment & Billing Module (Invoices, Receipts, Refund Vouchers)

export function printHtmlViaIframe(htmlContent, title = 'Hotel Document') {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @page { margin: 15mm; size: A4 portrait; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * { box-sizing: border-box; }
          .voucher-container {
            max-width: 780px;
            margin: 0 auto;
            padding: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1b7f43;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            margin: 0;
          }
          .brand-title span {
            color: #1b7f43;
          }
          .brand-subtitle {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
          }
          .doc-badge {
            text-align: right;
          }
          .doc-type {
            font-size: 16px;
            font-weight: 800;
            color: #dc2626;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doc-id {
            font-family: monospace;
            font-size: 14px;
            font-weight: 700;
            color: #374151;
            margin-top: 2px;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
          }
          .card-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #4b5563;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .row:last-child {
            margin-bottom: 0;
          }
          .label {
            color: #6b7280;
          }
          .val {
            font-weight: 600;
            color: #111827;
          }
          .financial-banner {
            background: #fef2f2;
            border: 1.5px solid #fecaca;
            border-radius: 8px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .financial-label {
            font-size: 13px;
            font-weight: 700;
            color: #991b1b;
            text-transform: uppercase;
          }
          .financial-sub {
            font-size: 11px;
            color: #b91c1c;
            margin-top: 2px;
          }
          .financial-amount {
            font-size: 26px;
            font-weight: 900;
            color: #dc2626;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 36px;
            padding-top: 16px;
          }
          .sig-line {
            border-top: 1px dashed #9ca3af;
            padding-top: 6px;
            text-align: center;
            font-size: 11px;
            color: #4b5563;
          }
          .footer-note {
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            margin-top: 28px;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 300);
}

export function generateRefundVoucherHtml(refund) {
  if (!refund) return '';

  return `
    <div class="voucher-container">
      <div class="header">
        <div>
          <h1 class="brand-title">Grand Imperial <span>Hotel & Resort</span></h1>
          <p class="brand-subtitle">Financial Accounting & Guest Disbursement Services &bull; Official Voucher</p>
        </div>
        <div class="doc-badge">
          <div class="doc-type">Refund Voucher</div>
          <div class="doc-id">${refund.id || refund.refundId || 'REF-VOUCHER'}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Date: ${refund.refundDate || new Date().toISOString().split('T')[0]}</div>
        </div>
      </div>

      <div class="financial-banner">
        <div>
          <div class="financial-label">Total Refund Disbursed</div>
          <div class="financial-sub">Status: <strong>${refund.status || 'Completed'}</strong> &bull; Method: ${refund.refundMethod || 'Original Payment Method'}</div>
        </div>
        <div class="financial-amount">
          $${(refund.amount || refund.refundAmount || 0).toFixed(2)}
        </div>
      </div>

      <div class="section-grid">
        <div class="card">
          <div class="card-title">Guest Details</div>
          <div class="row">
            <span class="label">Guest Name:</span>
            <span class="val">${refund.guestName || 'Guest'}</span>
          </div>
          <div class="row">
            <span class="label">Room Number:</span>
            <span class="val">Room ${refund.roomNumber || 'N/A'} (${refund.roomType || 'Standard'})</span>
          </div>
          <div class="row">
            <span class="label">Booking Ref:</span>
            <span class="val">${refund.bookingId || 'N/A'}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Audit & Traceability</div>
          <div class="row">
            <span class="label">Original Payment:</span>
            <span class="val">${refund.paymentId || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Invoice Number:</span>
            <span class="val">${refund.invoiceId || refund.invoiceNumber || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Authorized By:</span>
            <span class="val">${refund.processedBy || 'Duty Manager'}</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title">Disbursement Reason & Remarks</div>
        <div class="row" style="margin-bottom: 4px;">
          <span class="label">Primary Reason:</span>
          <span class="val" style="color: #991b1b;">${refund.reason || 'Booking Adjustment / Cancellation'}</span>
        </div>
        <div style="font-size: 11px; color: #4b5563; margin-top: 6px; background: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;">
          <strong>Manager Remarks:</strong> ${refund.notes || 'Refund verified and processed in compliance with hotel reservation and cancellation policy terms.'}
        </div>
      </div>

      <div class="signatures">
        <div>
          <div style="height: 35px;"></div>
          <div class="sig-line">Authorized Hotel Representative / Finance Manager</div>
        </div>
        <div>
          <div style="height: 35px;"></div>
          <div class="sig-line">Guest Signature / Acknowledgment of Receipt</div>
        </div>
      </div>

      <div class="footer-note">
        This is a computer-generated voucher and settlement record. For billing inquiries, contact accounting@grandimperialhotel.com
      </div>
    </div>
  `;
}

export function printRefundVoucher(refund) {
  const html = generateRefundVoucherHtml(refund);
  printHtmlViaIframe(html, `Refund_Voucher_${refund.id || 'REF'}`);
}
