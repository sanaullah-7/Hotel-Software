const fs = require('fs');

const hookFiles = [
    'Client/src/features/reservations/components/AddReservationForm/useAddReservation.js',
    'Client/src/features/reservations/pages/AddReservation/useAddReservation.js'
];

const indexFiles = [
    'Client/src/features/reservations/components/AddReservationForm/index.jsx',
    'Client/src/features/reservations/pages/AddReservation/index.jsx'
];

hookFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (!content.includes('guestProfileImage')) {
            const originalStateBlock = `  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);`;
            
            const newStateBlock = `  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [guestProfileImage, setGuestProfileImage] = useState(null);
  const profileImageInputRef = useRef(null);

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setGuestProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };`;
            
            content = content.replace(originalStateBlock, newStateBlock);
            
            // Add to returned object
            const returnBlock = `    handleFileChange,
    handleGuestSelect,`;
            
            const newReturnBlock = `    handleFileChange,
    guestProfileImage,
    profileImageInputRef,
    handleProfileImageChange,
    handleGuestSelect,`;
            
            content = content.replace(returnBlock, newReturnBlock);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Patched hook:', file);
        }
    }
});

indexFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (!content.includes('profileImageInputRef.current.click()')) {
            // Update the destructured hook return
            const originalDestructure = `    handleFileChange,
    handleGuestSelect,`;
            
            const newDestructure = `    handleFileChange,
    guestProfileImage,
    profileImageInputRef,
    handleProfileImageChange,
    handleGuestSelect,`;
            
            content = content.replace(originalDestructure, newDestructure);

            // Update the UI
            const originalUI = ` <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Person sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
 </div>
 
 {/* Auto-fill Dropdown */}
 <FormControl size="small" sx={{ ...muiInputSx, minWidth: 220 }}>`;

            const newUI = ` <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
            
            content = content.replace(originalUI, newUI);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Patched UI:', file);
        }
    }
});
