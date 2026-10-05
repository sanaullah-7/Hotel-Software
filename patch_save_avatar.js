const fs = require('fs');

const files = [
    'Client/src/features/reservations/pages/AddReservation.jsx',
    'Client/src/features/reservations/components/AddReservationForm/useAddReservation.js',
    'Client/src/features/reservations/pages/AddReservation/useAddReservation.js'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('guestProfileImage ||')) {
            console.log('Already patched:', file);
            return;
        }

        // AddReservation.jsx format
        if (content.includes(`avatar: 'https://i.pravatar.cc/150?img=1'`)) {
            content = content.replace(
                /avatar:\s*'https:\/\/i\.pravatar\.cc\/150\?img=1',/,
                `avatar: guestProfileImage || 'https://i.pravatar.cc/150?img=1',`
            );
        }

        // useAddReservation.js format
        if (content.includes(`avatar: 'https://i.pravatar.cc/150?img=' + (Math.floor(Math.random() * 70) + 1),`)) {
            content = content.replace(
                /avatar:\s*'https:\/\/i\.pravatar\.cc\/150\?img=' \+ \(Math\.floor\(Math\.random\(\) \* 70\) \+ 1\),/,
                `avatar: guestProfileImage || 'https://i.pravatar.cc/150?img=' + (Math.floor(Math.random() * 70) + 1),`
            );
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log('Patched handleSave for:', file);
    }
});
