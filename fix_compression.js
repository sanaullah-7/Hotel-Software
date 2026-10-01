const fs = require('fs');
const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/pages/EditReservation.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Add image compression helper after the state declarations
    if (!content.includes('compressImage')) {
        const compressionFn = `
 const compressImage = (file, maxWidth = 200, quality = 0.6) => {
   return new Promise((resolve) => {
     const reader = new FileReader();
     reader.onloadend = () => {
       const img = new Image();
       img.onload = () => {
         const canvas = document.createElement('canvas');
         const scale = Math.min(1, maxWidth / img.width);
         canvas.width = img.width * scale;
         canvas.height = img.height * scale;
         const ctx = canvas.getContext('2d');
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         resolve(canvas.toDataURL('image/jpeg', quality));
       };
       img.src = reader.result;
     };
     reader.readAsDataURL(file);
   });
 };
`;
        content = content.replace(
            ' const handleProfileImageChange = (e) => {',
            compressionFn + ' const handleProfileImageChange = (e) => {'
        );
    }
    
    // 2. Replace handleProfileImageChange to use compression
    content = content.replace(
        / const handleProfileImageChange = \(e\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*}\s*};\s*/,
        ` const handleProfileImageChange = async (e) => {
     if (e.target.files && e.target.files.length > 0) {
       const file = e.target.files[0];
       const compressed = await compressImage(file, 150, 0.5);
       setGuestProfileImage(compressed);
     }
   };

 `
    );
    
    // 3. Replace handleFileChange to use compression for CNIC
    content = content.replace(
        / const \[cnicBase64, setCnicBase64\] = useState\(null\);\s* const handleFileChange = \(e\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*}\s*};\s*/,
        ` const [cnicBase64, setCnicBase64] = useState(null);
 const handleFileChange = async (e) => {
   if (e.target.files && e.target.files.length > 0) {
     const file = e.target.files[0];
     setSelectedFile(file);
     const compressed = await compressImage(file, 400, 0.6);
     setCnicBase64(compressed);
   }
 };

 `
    );
    
    // 4. Wrap saveReservations in try-catch
    content = content.replace(
        ' saveReservations([{',
        ' try { saveReservations([{'
    );
    content = content.replace(
        '}, ...reservations]);\n  if (selectedRoom)',
        '}, ...reservations]); } catch(storageErr) { console.warn("Storage error saving reservation", storageErr); }\n  if (selectedRoom)'
    );
    
    // 5. Wrap CNIC localStorage.setItem in try-catch
    content = content.replace(
        'localStorage.setItem(\'hotel_registration_forms\', JSON.stringify([newDoc, ...storedDocs]));',
        'try { localStorage.setItem(\'hotel_registration_forms\', JSON.stringify([newDoc, ...storedDocs])); } catch(e) { console.warn("CNIC storage error", e); }'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched with compression + error handling:', file);
});
