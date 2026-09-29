const fs = require('fs');

// ---- PaymentHistory ----
let ph = fs.readFileSync('Client/src/features/payment-billing/pages/PaymentHistory.jsx', 'utf8');
const phOld = /{\/\* Metric Cards \(Heading Removed\) \*\/}[\s\S]*?<\/div>\s*\s*{\/\* Filter and Search Bar \*\/}/;
const phNew = `{/* Metric Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Gross Collected ({metrics.totalTransactions} TXNs)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <PaymentIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.cardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Card Payments ({metrics.cardCount} Cards)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
          <ReceiptIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.otherAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Cash & Alternative</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
          <PendingIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Net Settled Revenue</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
          <TrendingUpIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
   </div>

  {/* Filter and Search Bar */}`;
ph = ph.replace(phOld, phNew);
fs.writeFileSync('Client/src/features/payment-billing/pages/PaymentHistory.jsx', ph, 'utf8');
console.log('PaymentHistory done');

// ---- PendingPayments ----
let pp = fs.readFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', 'utf8');
const ppOld = /{\/\* Summary Cards \*\/}[\s\S]*?<\/div>\s*\s*{\/\* Filter and Search \*\/}/;
const ppNew = `{/* Summary Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Total Receivable ({metrics.totalPendingCount} Folios)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <HourglassEmptyIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Overdue Collection ({metrics.overdueCount} Urgent)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
          <WarningIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.partialAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Partially Paid ({metrics.partialCount} Invoices)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
          <MoneyOffIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
   </div>

  {/* Filter and Search */}`;
pp = pp.replace(ppOld, ppNew);
fs.writeFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', pp, 'utf8');
console.log('PendingPayments done');

// ---- Refunds ----
let rf = fs.readFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', 'utf8');
const rfOld = /{\/\* Metric Cards \*\/}[\s\S]*?<\/div>\s*\s*{\/\* Filter and Search \*\/}/;
const rfNew = `{/* Metric Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Total Refunded ({metrics.completedCount} Processed)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <MoneyOffIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.completedCount}</div>
          <div className="text-[13px] text-gray-500 font-medium">Settled Returns</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
          <CheckCircleIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">\${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[13px] text-gray-500 font-medium">Pending Review ({metrics.pendingCount} Pending)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
          <PendingIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.totalRefundsCount}</div>
          <div className="text-[13px] text-gray-500 font-medium">Total Claims</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
          <GavelIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
   </div>

  {/* Filter and Search */}`;
rf = rf.replace(rfOld, rfNew);
fs.writeFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', rf, 'utf8');
console.log('Refunds done');
