const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content.includes('{/* Pagination Footer */}') && !content.includes('{/* Footer Pagination */}')) {
        return;
    }
    if (content.includes('CustomPagination')) {
        return;
    }
    
    let lengthVar = 'data.length';
    let lengthMatch = content.match(/of\s*\{([a-zA-Z0-9_\.]+\.length)\}/);
    if (lengthMatch) lengthVar = lengthMatch[1];
    else {
        lengthMatch = content.match(/>=\s*([a-zA-Z0-9_\.]+\.length)\}/);
        if (lengthMatch) lengthVar = lengthMatch[1];
    }
    
    let pageVar = 'page';
    let setPageVar = 'setPage';
    let isZeroIndexed = true;
    
    if (content.includes('currentPage') && content.includes('setCurrentPage')) {
        pageVar = 'currentPage';
        setPageVar = 'setCurrentPage';
        isZeroIndexed = false;
    }
    
    let rowsPerPageVar = '10';
    if (content.includes('itemsPerPage')) rowsPerPageVar = 'itemsPerPage';
    else if (content.includes('rowsPerPage')) rowsPerPageVar = 'rowsPerPage';
    
    let fileDir = path.dirname(filePath);
    let targetDir = path.join('Client', 'src', 'components', 'common');
    let relPath = path.relative(fileDir, targetDir).replace(/\\/g, '/');
    content = content.replace("import React", `import CustomPagination from '${relPath}/CustomPagination';\nimport React`);

    let parts = content.split(/\{\/\*\s*(?:Pagination Footer|Footer Pagination)\s*\*\/\}/);
    if (parts.length > 1) {
        let before = parts[0];
        let after = parts[1];
        
        let lines = after.split('\n');
        let outLines = [];
        let skipped = true;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (skipped) {
                // If we see another comment, or we see multiple </div> closing the component
                if (line.includes('{/*') || (line.trim() === '</div>' && (lines[i+1] && lines[i+1].includes('</div>')))) {
                    skipped = false;
                    outLines.push(line);
                } else if (line.trim() === ');') {
                    skipped = false;
                    outLines.push(line);
                }
            } else {
                outLines.push(line);
            }
        }
        
        let pageProp = isZeroIndexed ? `${pageVar} + 1` : pageVar;
        let onPageChangeProp = isZeroIndexed ? `(e, p) => ${setPageVar}(p - 1)` : `(e, p) => ${setPageVar}(p)`;
        
        let newPagination = `
      {/* Pagination Footer */}
      <CustomPagination
        totalItems={${lengthVar}}
        page={${pageProp}}
        onPageChange={${onPageChangeProp}}
        itemsPerPage={${rowsPerPageVar}}
      />
`;
        
        content = before + newPagination + outLines.join('\n');
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log("Updated", filePath);
    }
}

walkDir('Client/src', processFile);
console.log("Finished");
