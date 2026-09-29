const fs = require('fs');
let content = fs.readFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', 'utf8');

const muiSelectSx = `const muiSelectSx = {
 '& .MuiOutlinedInput-root': {
 borderRadius:'8px', backgroundColor:'#ffffff', fontSize:'12px', height:'32px', color:'#1f2937',
 '& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },
 '&:hover fieldset': { borderColor:'#9ca3af' },
 '&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },
 '& .MuiSelect-select': { padding:'0 8px', display:'flex', alignItems:'center', height:'32px' },
 '& .MuiInputLabel-root': { fontSize:'13px', color:'#6b7280', transform:'translate(14px, 7px) scale(1)', '&.Mui-focused': { color:'#1b7f43' } },
 '& .MuiInputLabel-root.MuiInputLabel-shrink': { transform:'translate(14px, -9px) scale(0.75)' }
};`;
const searchInputProps = `sx={{ minWidth: 140, flexGrow: 1, maxWidth: { xs: '100%', sm: 180 },'& .MuiInputBase-root': { height:'32px', backgroundColor:'white', fontSize:'12px', borderRadius:'8px' },'& .MuiOutlinedInput-input': { padding:'0 8px' },'& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'& .Mui-focused fieldset': { borderColor:'#1b7f43 !important', borderWidth:'1.5px !important' } }}`;

if (!content.includes('muiSelectSx')) {
    content = content.replace(/(export default function [A-Za-z]+\(\) \{)/, `${muiSelectSx}\n\n$1`);
}
if (!content.includes('FormControl')) {
    content = content.replace(/import \{/, "import { FormControl, Select, InputLabel, ");
}

const beforeCards = content.split('{/* Summary Cards */}')[0];
const afterTableStart = content.split('<thead')[1];

let newCardsAndTableStart = `{/* Summary Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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

  {/* Filter and Search */}
  <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5">
   <div className="p-3 border-b border-gray-100">
     <div className="flex flex-wrap items-end gap-2.5 w-full">
       <TextField
         variant="outlined" size="small" placeholder="Search pending invoice #, guest, room..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color:'text.secondary', ml: -0.5, mr: 0.5 }} /></InputAdornment> }}
         ${searchInputProps}
       />
       <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
         <InputLabel>Status</InputLabel>
         <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
           {['All', 'Unpaid', 'Partially Paid', 'Overdue'].map(opt => (
             <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>
           ))}
         </Select>
       </FormControl>
       <div className="flex-grow"></div>
     </div>
   </div>
   
   <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    <table className="w-full text-left">
     <thead`;

content = beforeCards + newCardsAndTableStart + afterTableStart;
fs.writeFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', content, 'utf8');
