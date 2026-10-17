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

export function generateZReportHtml(shift, hotelName = 'Grand Imperial Hotel & Resort') {
  if (!shift) return '';

  const formatPKR = (amt) =>
    `PKR ${(Number(amt) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const discrepancy = Number(shift.discrepancy_amount || 0);
  let statusBadgeColor = '#059669';
  let statusBadgeText = 'BALANCED (Zero Discrepancy)';

  if (discrepancy < 0) {
    statusBadgeColor = '#dc2626';
    statusBadgeText = `SHORTAGE (${formatPKR(Math.abs(discrepancy))})`;
  } else if (discrepancy > 0) {
    statusBadgeColor = '#2563eb';
    statusBadgeText = `OVERAGE (+${formatPKR(discrepancy)})`;
  }

  const tender = shift.tender_summary || {};
  const openedDate = shift.opened_at ? new Date(shift.opened_at).toLocaleString() : 'N/A';
  const closedDate = shift.closed_at ? new Date(shift.closed_at).toLocaleString() : 'N/A';

  return `
    <div class="voucher-container" style="max-width: 820px; margin: 0 auto; padding: 24px; border: 2px solid #1b7f43; border-radius: 8px;">
      <div class="header" style="border-bottom: 2px solid #1b7f43; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 class="brand-title" style="font-size: 22px; font-weight: 800; color: #1b7f43; margin: 0;">${hotelName}</h1>
          <p class="brand-subtitle" style="font-size: 11px; color: #64748b; margin: 3px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Front Desk Operations &bull; Authoritative Z-Report (End-of-Shift Reconciliation)</p>
        </div>
        <div class="doc-badge" style="text-align: right;">
          <div class="doc-type" style="font-size: 15px; font-weight: 800; color: #1b7f43; text-transform: uppercase;">Z-REPORT</div>
          <div class="doc-id" style="font-family: monospace; font-size: 13px; font-weight: 700; color: #1b7f43; margin-top: 2px;">${shift.shift_number || 'SHF-UNKNOWN'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Status: <strong style="color: #059669;">${shift.status || 'CLOSED'}</strong></div>
        </div>
      </div>

      <!-- Shift Metadata Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Staff & Terminal</div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #64748b;">Primary Cashier:</span> <strong>${shift.staff_name || 'Cashier'}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #64748b;">Drawer / Station:</span> <strong>${shift.drawer_name || 'Front Desk Drawer'}</strong></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;"><span style="color: #64748b;">Closed / Sealed By:</span> <strong>${shift.closed_by_name || shift.staff_name || 'Admin'}</strong></div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Shift Timestamps</div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #64748b;">Opened:</span> <span>${openedDate}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span style="color: #64748b;">Closed:</span> <span>${closedDate}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;"><span style="color: #64748b;">Report Run:</span> <span>${new Date().toLocaleString()}</span></div>
        </div>
      </div>

      <!-- Authoritative Cash Drawer Balance Summary -->
      <div style="background: #ffffff; border: 2px solid #1b7f43; border-radius: 6px; margin-bottom: 16px; overflow: hidden;">
        <div style="background: #1b7f43; color: #ffffff; padding: 8px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
          <span>Physical Cash Drawer Reconciliation</span>
          <span style="font-size: 11px; background: ${statusBadgeColor}; padding: 2px 8px; border-radius: 4px; color: #ffffff;">${statusBadgeText}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 14px; color: #334155;">(+) Opening Float (Starting Cash)</td>
              <td style="padding: 8px 14px; text-align: right; font-family: monospace; font-weight: 600;">${formatPKR(shift.opening_float)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 14px; color: #334155;">(+) Cash Receipts / Collections</td>
              <td style="padding: 8px 14px; text-align: right; font-family: monospace; font-weight: 600; color: #059669;">+${formatPKR(shift.cash_collected)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 14px; color: #334155;">(-) Cash Refunds Disbursed</td>
              <td style="padding: 8px 14px; text-align: right; font-family: monospace; font-weight: 600; color: #dc2626;">-${formatPKR(shift.cash_refunds)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 14px; color: #334155;">(-) Cash Paid Out (Expenses)</td>
              <td style="padding: 8px 14px; text-align: right; font-family: monospace; font-weight: 600; color: #dc2626;">-${formatPKR(shift.cash_paid_out)}</td>
            </tr>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-weight: 700;">
              <td style="padding: 10px 14px; color: #1b7f43; font-size: 13px;">(=) Expected Physical Cash in Drawer</td>
              <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 13px; color: #1b7f43;">${formatPKR(shift.expected_cash)}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; font-weight: 700;">
              <td style="padding: 10px 14px; color: #1e293b; font-size: 13px;">(vs) Actual Physical Counted Cash</td>
              <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 13px; color: #1e293b;">${formatPKR(shift.actual_counted_cash)}</td>
            </tr>
            <tr style="background: ${discrepancy === 0 ? '#f0fdf4' : discrepancy < 0 ? '#fef2f2' : '#eff6ff'}; font-weight: 800;">
              <td style="padding: 10px 14px; font-size: 13px; color: ${statusBadgeColor};">Discrepancy (Variance = Counted &minus; Expected)</td>
              <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 14px; color: ${statusBadgeColor};">${discrepancy > 0 ? '+' : ''}${formatPKR(discrepancy)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Non-Cash Tender Summary (Isolated from physical cash drawer) -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
          Electronic & Non-Cash Tender Breakdown (Direct Bank/Merchant Settlement)
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; font-size: 11px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px;">
            <div style="color: #64748b;">Credit/Debit Card</div>
            <div style="font-family: monospace; font-weight: 700; color: #1e293b; margin-top: 2px;">${formatPKR(tender.card_total || 0)}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px;">
            <div style="color: #64748b;">Bank Transfer</div>
            <div style="font-family: monospace; font-weight: 700; color: #1e293b; margin-top: 2px;">${formatPKR(tender.bank_total || 0)}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px;">
            <div style="color: #64748b;">Digital Wallet</div>
            <div style="font-family: monospace; font-weight: 700; color: #1e293b; margin-top: 2px;">${formatPKR(tender.wallet_total || 0)}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px;">
            <div style="color: #64748b;">Other / Misc</div>
            <div style="font-family: monospace; font-weight: 700; color: #1e293b; margin-top: 2px;">${formatPKR(tender.other_total || 0)}</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
          <span>Total Transactions: <strong>${tender.total_payments_count || 0}</strong></span>
          <span>Grand Total Collections (All Tenders): <strong style="font-family: monospace; color: #1b7f43;">${formatPKR(tender.total_collected_all_tenders || 0)}</strong></span>
        </div>
      </div>

      <!-- Notes -->
      ${shift.notes ? `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 4px;">Operational Notes & Handover Log</div>
          <div style="font-size: 11px; color: #334155; white-space: pre-wrap;">${shift.notes}</div>
        </div>
      ` : ''}

      <!-- Handover Signatures -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 28px; margin-bottom: 14px;">
        <div>
          <div style="height: 36px; border-bottom: 1px solid #94a3b8;"></div>
          <div style="text-align: center; font-size: 10px; text-transform: uppercase; font-weight: 700; color: #475569; margin-top: 4px;">Outbound Cashier Signature</div>
          <div style="text-align: center; font-size: 10px; color: #64748b;">(${shift.staff_name || 'Cashier'})</div>
        </div>
        <div>
          <div style="height: 36px; border-bottom: 1px solid #94a3b8;"></div>
          <div style="text-align: center; font-size: 10px; text-transform: uppercase; font-weight: 700; color: #475569; margin-top: 4px;">Supervisor / Inbound Cashier Signature</div>
          <div style="text-align: center; font-size: 10px; color: #64748b;">(Drawer Verification & Acceptance)</div>
        </div>
      </div>

      <div style="text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 16px;">
        Authoritative System Z-Report &bull; Immutable Ledger Record &bull; Generated from sealed backend shift #${shift.shift_number || ''}
      </div>
    </div>
  `;
}

export function printZReport(shift, hotelName) {
  const html = generateZReportHtml(shift, hotelName);
  printHtmlViaIframe(html, `Z_Report_${shift?.shift_number || 'SHIFT'}`);
}

