const fs = require('fs');
const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/pages/EditReservation.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the CNIC upload div+input with label approach
    content = content.replace(
        /\{\/\* File Upload Box \*\/\}\s*<div[\s\S]*?onClick=\{.*?fileInputRef\.current\?\.click\(\).*?\}\s*>\s*<input\s+type="file"\s+ref=\{fileInputRef\}[\s\S]*?\/>\s*<UploadFile[\s\S]*?<\/div>/,
        `{/* File Upload Box */}
 <input 
   type="file" 
   ref={fileInputRef} 
   onChange={handleFileChange} 
   accept="image/*,.pdf"
   className="hidden" 
   id="cnic-upload"
 />
 <label 
   htmlFor="cnic-upload"
   className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#fafafa]"
 >
   <UploadFile className="text-gray-400 mb-2" sx={{ fontSize: 32 }} />
   <p className="text-sm font-semibold text-gray-700">Upload Your CNIC</p>
   <p className="text-xs text-gray-400 mt-1">
     {selectedFile ? <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span> : 'No file chosen'}
   </p>
 </label>`
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed CNIC upload in:', file);
});
