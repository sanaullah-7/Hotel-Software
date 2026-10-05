const fs = require('fs');
const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/pages/EditReservation.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the broken try without catch - the try wraps saveReservations but has no catch
    // It should be: try { saveReservations(...); } catch(storageErr) { ... }
    // Currently: try { saveReservations([{ ... }]); if (selectedRoom) ...
    //            if (cnicBase64) { ... }
    //            navigate('/reservation/all');
    //           };
    
    // The issue: "try { saveReservations(... } catch(storageErr)..." - the catch was added after }, ...reservations]); 
    // but } catch(storageErr) { } is missing its closing brace correctly
    
    // Let's find and fix the broken try-catch around saveReservations
    content = content.replace(
        / try \{ saveReservations\(\[\{([\s\S]*?)\}, \.\.\.reservations\]\); \} catch\(storageErr\) \{ console\.warn\("Storage error saving reservation", storageErr\); \}/,
        ' try { saveReservations([{$1}, ...reservations]); } catch(storageErr) { console.warn("Storage quota exceeded", storageErr); }'
    );
    
    // Also fix the broken pattern if it's still in original form
    content = content.replace(
        / try \{ saveReservations\(\[\{/,
        ' try { saveReservations([{'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Checked:', file);
});
