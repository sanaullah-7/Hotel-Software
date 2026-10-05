const fs = require('fs');

const indexFiles = [
    'Client/src/features/reservations/components/AddReservationForm/index.jsx',
    'Client/src/features/reservations/pages/AddReservation/index.jsx'
];

indexFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (!content.includes('profileImageInputRef.current.click()')) {
            // Update the destructured hook return
            const originalDestructure = `    handleFileChange,\n    handleGuestSelect,\n    handleChange,`;
            
            const newDestructure = `    handleFileChange,\n    guestProfileImage,\n    profileImageInputRef,\n    handleProfileImageChange,\n    handleGuestSelect,\n    handleChange,`;
            
            content = content.replace(originalDestructure, newDestructure);

            // Update the UI
            const originalUI = ` </div>\n \n {/* Auto-fill Dropdown */}`;

            const newUI = ` </div>\n\n {/* Upload Profile Field */}\n <div className="flex items-center justify-center">\n   <div \n     className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group"\n     onClick={() => profileImageInputRef.current?.click()}\n   >\n     {guestProfileImage ? (\n       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />\n     ) : (\n       <Person className="text-gray-400" />\n     )}\n     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">\n       <span className="text-[10px] text-white font-medium">Upload</span>\n     </div>\n   </div>\n   <input \n     type="file" \n     accept="image/*" \n     className="hidden" \n     ref={profileImageInputRef} \n     onChange={handleProfileImageChange} \n   />\n </div>\n \n {/* Auto-fill Dropdown */}`;
            
            if (content.includes(' {/* Auto-fill Dropdown */}')) {
                // safer replace
                content = content.replace(/<\/div>[\s\n]*{\/\* Auto-fill Dropdown \*\/}/, `</div>\n\n {/* Upload Profile Field */}\n <div className="flex items-center justify-center">\n   <div \n     className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group"\n     onClick={() => profileImageInputRef.current?.click()}\n   >\n     {guestProfileImage ? (\n       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />\n     ) : (\n       <Person className="text-gray-400" />\n     )}\n     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">\n       <span className="text-[10px] text-white font-medium text-center leading-tight">Upload</span>\n     </div>\n   </div>\n   <div className="text-xs text-gray-500 hidden sm:block">\n     Upload<br/>Profile\n   </div>\n   <input \n     type="file" \n     accept="image/*" \n     className="hidden" \n     ref={profileImageInputRef} \n     onChange={handleProfileImageChange} \n   />\n </div>\n \n {/* Auto-fill Dropdown */}`);
            }

            // We must also update the destructure manually because whitespaces vary
            content = content.replace(
                /handleFileChange,[\s\n]*handleGuestSelect,/,
                `handleFileChange,\n guestProfileImage,\n profileImageInputRef,\n handleProfileImageChange,\n handleGuestSelect,`
            );

            fs.writeFileSync(file, content, 'utf8');
            console.log('Patched UI for:', file);
        } else {
            console.log('Already patched:', file);
        }
    }
});
