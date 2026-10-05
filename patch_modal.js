const fs = require('fs');

const files = [
    'Client/src/features/reservations/pages/AllReservations.jsx',
    'Client/src/pages/Dashboard/components/CurrentBookingsTable.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Find openNewModal and replace its body
        const newFn = `const openNewModal = () => {\n    navigate('/reservation/new');\n  };`;
        
        // Use regex to replace the old openNewModal
        content = content.replace(
            /const openNewModal = \(\) => {[\s\S]*?setIsBookingModalOpen\(true\);\s*};/,
            newFn
        );
        
        fs.writeFileSync(file, content, 'utf8');
        console.log('Patched openNewModal in', file);
    }
});
