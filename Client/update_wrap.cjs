const fs = require('fs');
let file = 'src/pages/Housekeeping/RoomsAndCleaning.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove whitespace-nowrap from table
    content = content.replace('<table className="w-full text-left whitespace-nowrap">', '<table className="w-full text-left">');

    fs.writeFileSync(file, content);
    console.log('Updated RoomsAndCleaning.jsx to allow wrapping');
}
