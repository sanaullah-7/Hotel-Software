const fs = require('fs');
const path = require('path');

const dir = 'Client/src/features/payment-billing/pages';

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

function patchFile(fileName) {
  let p = path.join(dir, fileName);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');

  // Insert muiSelectSx if not there
  if (!content.includes('muiSelectSx')) {
    content = content.replace(/(export default function [A-Za-z]+\(\) \{)/, `${muiSelectSx}\n\n$1`);
  }
  if (!content.includes('FormControl')) {
    content = content.replace(/import \{/, "import { FormControl, Select, InputLabel, ");
  }

  // Common card replacements
  if (fileName === 'Invoices.jsx') {
    content = content.replace(/<div className="grid grid-cols-2 lg:grid-cols-4 gap-2">[\s\S]*?\{.*?Total Invoiced.*?\}[\s\S]*?\{.*?Collected Revenue.*?\}[\s\S]*?\{.*?Outstanding Balance.*?\}[\s\S]*?\{.*?Overdue Invoices.*?\}[\s\S]*?<\/div>\s*<\/div>/,
`<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
          <div className="text-[13px] text-gray-500 font-medium">Collected ({metrics.collectionRate}%)</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
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
          <div className="text-[13px] text-gray-500 font-medium">Overdue Invoices</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
          <WarningIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
   </div>`);

    content = content.replace(/\{\/\* Filter and Search Bar \*\/\}[\s\S]*?\{\/\* Invoices Table Container.*?w-full"\>/,
`  {/* Filter and Search Bar */}
  <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5">
   <div className="p-3 border-b border-gray-100">
     <div className="flex flex-wrap items-end gap-2.5 w-full">
       <TextField
         variant="outlined" size="small" placeholder="Search invoices..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color:'text.secondary', ml: -0.5, mr: 0.5 }} /></InputAdornment> }}
         ${searchInputProps}
       />
       <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
         <InputLabel>Status</InputLabel>
         <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
           {['All', 'Paid', 'Partially Paid', 'Unpaid', 'Overdue', 'Draft'].map(opt => (
             <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>
           ))}
         </Select>
       </FormControl>
       <div className="flex-grow"></div>
       <Button variant="contained" size="small" 
         sx={{ height:'32px', textTransform:'none', fontSize:'12px', minWidth: 80, px: 1.5, backgroundColor:'#1b7f43', borderRadius:'8px', '&:hover': { backgroundColor:'#156736'} }}
         onClick={() => { setSelectedInvoiceForPayment(null); setIsRecordPaymentOpen(true); }}
       >
         + Record Payment
       </Button>
     </div>
   </div>
   
   <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">`);
    
    // Update table headers
    content = content.replace(/<table className="w-full table-fixed text-left border-collapse max-lg:min-w-\[850px\]">[\s\S]*?<\/thead>/,
`<table className="w-full text-left">
     <thead className="bg-gray-50/50">
       <tr>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Invoice #</th>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Date & Due</th>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Guest</th>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Total</th>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Status</th>
         <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Actions</th>
       </tr>
     </thead>`);
  }

  // Will do the rest dynamically
  fs.writeFileSync(p, content, 'utf8');
}

patchFile('Invoices.jsx');
console.log('Done Invoices');
