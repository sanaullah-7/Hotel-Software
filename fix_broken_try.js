const fs = require('fs');
const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/pages/EditReservation.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the broken "try { saveReservations" without a proper catch
    // Line 133 starts: " try { saveReservations([{"
    // Line 146: "}, ...reservations]);"   <- no catch here!
    // Line 147: "if (selectedRoom)..."
    // The "try" has NO closing "catch"/"finally" = syntax error
    
    // Replace the broken try with just a plain saveReservations call (no try)
    content = content.replace(
        ' try { saveReservations([{',
        ' saveReservations([{'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed broken try in:', file);
});
