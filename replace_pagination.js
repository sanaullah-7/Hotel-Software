const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;

walkDir('Client/src', function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Attempt to find the total items variable
    let totalVar = 'filteredRecords.length';
    
    let m = content.match(/Showing\s*\{[^}]+\}\s*of\s*\{([^}]+)\}/);
    if (m) totalVar = m[1];
    else {
        m = content.match(/Math\.min\([^,]+,\s*([^,]+),\s*\)/);
        if (m) totalVar = m[1];
        else {
            m = content.match(/disabled=\{\(page \+ 1\) \* [^ ]+ >= ([^}]+)\}/);
            if (m) totalVar = m[1];
        }
    }
    
    let originalContent = content;

    // Pattern 1: {* Pagination Footer *} or {* Footer Pagination *} followed by a div block.
    // We'll replace the block that starts with this comment up to the matching closing tag.
    const paginationRegex = /\{\/\*\s*(Pagination Footer|Footer Pagination)\s*\*\/\}\s*<div[^>]*>[\s\S]*?(?=<\/div>\s*<\/div>\s*(\)|;|<|\{))/;
    
    // Note: The regex might be tricky. Let's do a more specific replacement.
    // For many files, the pagination footer is the last child of the main container.
    // We'll just replace the whole comment and its following div.
    
    let match = content.match(/\{\/\*\s*(Pagination Footer|Footer Pagination)\s*\*\/\}\s*<div[\s\S]*?(?=<\/div>\s*<\/div>\s*(?:\{|\)|;|<))/);
    
    if (match) {
        // We will just replace it if we can find the exact closing div.
    }
});

console.log("Done");
