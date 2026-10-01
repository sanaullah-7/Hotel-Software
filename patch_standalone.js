const fs = require('fs');

const file = 'Client/src/features/reservations/pages/AddReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state for guest profile image
if (!content.includes('guestProfileImage')) {
    content = content.replace(
        /const \[selectedFile, setSelectedFile\] = useState\(null\);\s*const fileInputRef = React\.useRef\(null\);\s*const handleFileChange = \(e\) => {[\s\S]*?};\s*/,
        `const [selectedFile, setSelectedFile] = useState(null);\n const fileInputRef = React.useRef(null);\n const [guestProfileImage, setGuestProfileImage] = useState(null);\n const profileImageInputRef = React.useRef(null);\n\n const handleFileChange = (e) => {\n if (e.target.files && e.target.files.length > 0) {\n setSelectedFile(e.target.files[0]);\n }\n };\n\n const handleProfileImageChange = (e) => {\n if (e.target.files && e.target.files.length > 0) {\n setGuestProfileImage(URL.createObjectURL(e.target.files[0]));\n }\n };\n\n `
    );
}

// 2. Update the UI
if (!content.includes('profileImageInputRef.current?.click()')) {
    content = content.replace(
        /<\/div>[\s\n]*{\/\* Auto-fill Dropdown \*\/}/, 
        `</div>\n\n {/* Upload Profile Field */}\n <div className="flex items-center justify-center">\n   <div \n     className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group"\n     onClick={() => profileImageInputRef.current?.click()}\n   >\n     {guestProfileImage ? (\n       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />\n     ) : (\n       <Person className="text-gray-400" />\n     )}\n     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">\n       <span className="text-[10px] text-white font-medium text-center leading-tight">Upload</span>\n     </div>\n   </div>\n   <div className="text-xs text-gray-500 hidden sm:block ml-2">\n     Upload<br/>Profile\n   </div>\n   <input \n     type="file" \n     accept="image/*" \n     className="hidden" \n     ref={profileImageInputRef} \n     onChange={handleProfileImageChange} \n   />\n </div>\n \n {/* Auto-fill Dropdown */}`
    );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched AddReservation.jsx');
