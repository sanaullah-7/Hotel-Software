const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let files = [];
walkDir('Client/src', function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('ChevronLeftIcon') || content.includes('< Prev') || content.includes('PaginationControls')) {
        if (!filePath.includes('PaginationControls.jsx')) {
            files.push(filePath);
        }
    }
});

console.log(files.join('\n'));
