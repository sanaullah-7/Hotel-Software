const fs = require('fs');
const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/pages/EditReservation.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the profile image upload div+input with label approach
    // The pattern: a div with rounded-full that has onClick and contains the input
    content = content.replace(
        /\{\/\* Upload Profile Field \*\/\}\s*<div className="flex items-center justify-center">\s*<div\s[\s\S]*?onClick=\{.*?profileImageInputRef\.current\?\.click\(\).*?\}\s*>[\s\S]*?<\/div>\s*<div className="text-xs text-gray-500 hidden sm:block ml-2">[\s\S]*?<\/div>\s*<input[\s\S]*?onChange=\{handleProfileImageChange\}\s*\/>\s*<\/div>/,
        `{/* Upload Profile Field */}
 <div className="flex items-center justify-center">
   <input 
     type="file" 
     accept="image/*" 
     className="hidden" 
     id="profile-upload"
     ref={profileImageInputRef} 
     onChange={handleProfileImageChange} 
   />
   <label htmlFor="profile-upload" className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group">
     {guestProfileImage ? (
       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />
     ) : (
       <Person className="text-gray-400" />
     )}
     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
       <span className="text-[10px] text-white font-medium text-center leading-tight">Upload</span>
     </div>
   </label>
   <div className="text-xs text-gray-500 hidden sm:block ml-2">
     Upload<br/>Profile
   </div>
 </div>`
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed profile upload in:', file);
});
