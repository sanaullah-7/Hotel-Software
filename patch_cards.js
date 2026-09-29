const fs = require('fs');

// Invoices.jsx - 4 cards
let inv = fs.readFileSync('Client/src/features/payment-billing/pages/Invoices.jsx', 'utf8');

const invoiceCardsOld = /{\/\* Metric Cards \*\/}[\s\S]*?<\/div>\s*\s*{\/\* Filter and Search Bar \*\/}/;

const invoiceCardsNew = `{/* Metric Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Total Invoiced ({invoices.length} Folios)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <InvoiceIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Collected Revenue ({metrics.collectionRate}%)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
          <PaidIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Outstanding Balance</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
          <PendingIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Overdue Invoices ({metrics.overdueCount} Past Due)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
          <WarningIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
   </div>

  {/* Filter and Search Bar */}`;

inv = inv.replace(invoiceCardsOld, invoiceCardsNew);
fs.writeFileSync('Client/src/features/payment-billing/pages/Invoices.jsx', inv, 'utf8');
console.log('Invoices done');
