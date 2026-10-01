const fs = require('fs');
const files = [
    'Client/src/features/reservations/components/AddReservationForm/useAddReservation.js',
    'Client/src/features/reservations/pages/AddReservation/useAddReservation.js'
];
files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/navigate\n\s*};\n\s*const handleChange/, "navigate('/reservation/all');\n  };\n\n  const handleChange");
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Fixed navigate in hooks');
