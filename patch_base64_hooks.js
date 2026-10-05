const fs = require('fs');

const files = [
    'Client/src/features/reservations/components/AddReservationForm/useAddReservation.js',
    'Client/src/features/reservations/pages/AddReservation/useAddReservation.js'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        content = content.replace(
            /const handleProfileImageChange = \(e\) => {[\s\S]*?};\s*/,
            `const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuestProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };\n\n `
        );
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Patched all to base64');
