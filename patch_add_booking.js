const fs = require('fs');
let content = fs.readFileSync('Client/src/features/reservations/pages/AddReservation.jsx', 'utf8');

// 1. Add state for guest profile image
const originalStateBlock = ` const [selectedFile, setSelectedFile] = useState(null);
 const fileInputRef = React.useRef(null);

 const handleFileChange = (e) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedFile(e.target.files[0]);
 }
 };`;

const newStateBlock = ` const [selectedFile, setSelectedFile] = useState(null);
 const fileInputRef = React.useRef(null);
 const [guestProfileImage, setGuestProfileImage] = useState(null);
 const profileImageInputRef = React.useRef(null);

 const handleFileChange = (e) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedFile(e.target.files[0]);
 }
 };

 const handleProfileImageChange = (e) => {
 if (e.target.files && e.target.files.length > 0) {
 setGuestProfileImage(URL.createObjectURL(e.target.files[0]));
 }
 };`;

content = content.replace(originalStateBlock, newStateBlock);

// 2. Add the upload element in the middle of Guest Information and Dropdown
const originalSection1 = ` {/* SECTION 1: GUEST INFORMATION */}
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Person sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
 </div>
 
 {/* Auto-fill Dropdown */}
 <FormControl size="small" sx={{ ...muiInputSx, minWidth: 220 }}>`;

const newSection1 = ` {/* SECTION 1: GUEST INFORMATION */}
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Person sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
 </div>

 {/* Upload Profile Field */}
 <div className="flex items-center justify-center">
   <div 
     className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group"
     onClick={() => profileImageInputRef.current.click()}
   >
     {guestProfileImage ? (
       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />
     ) : (
       <Person className="text-gray-400" />
     )}
     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
       <span className="text-[10px] text-white font-medium">Upload</span>
     </div>
   </div>
   <input 
     type="file" 
     accept="image/*" 
     className="hidden" 
     ref={profileImageInputRef} 
     onChange={handleProfileImageChange} 
   />
 </div>
 
 {/* Auto-fill Dropdown */}
 <FormControl size="small" sx={{ ...muiInputSx, minWidth: 220 }}>`;

content = content.replace(originalSection1, newSection1);

fs.writeFileSync('Client/src/features/reservations/pages/AddReservation.jsx', content, 'utf8');
console.log('Successfully updated AddReservation.jsx');
