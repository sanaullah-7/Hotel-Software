const fs = require('fs');
 // Note: we don't have glob, I'll just use a direct list or recursive search

function findFiles(dir, ext) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(file, ext));
        } else {
            if (file.endsWith(ext)) results.push(file);
        }
    });
    return results;
}

const files = findFiles('Client/src', '.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    
    // Simplistic duplicate remover for exact string matches that cause issues
    const removeExact = [
        'import React, { useState } from "react";\r',
        'import React, { useState } from "react";',
        'import React, { useState } from \'react\';'
    ];

    let hasSeenReactImport = false;
    lines = lines.filter(line => {
        // If it's a known duplicate exact line, only keep the first one
        if (line.includes('import React, { useState } from "react"') || 
            line.includes('import React, { useState } from \'react\'')) {
            if (!hasSeenReactImport) {
                hasSeenReactImport = true;
                return true;
            }
            return false;
        }
        
        return true;
    });

    content = lines.join('\n');
    
    // Specific fixes for RoomsAndCleaning.jsx
    if (file.includes('RoomsAndCleaning.jsx')) {
        content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/, '');
        content = content.replace(/import \{ IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel \} from "@mui\/material";\r?\n/, 'import { IconButton, Menu, Dialog } from "@mui/material";\n');
    }
    
    // Specific fixes for AllReservations.jsx
    if (file.includes('AllReservations.jsx')) {
        content = content.replace(/import React, \{ useState, useEffect \} from "react";\r?\n/, '');
        content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/, '');
    }

    // Specific fixes for GuestComplaint.jsx
    if (file.includes('GuestComplaint.jsx')) {
        content = content.replace(/import React, \{ useState \} from "react";\r?\n/, '');
    }
    
    // Specific fixes for Occupancy.jsx
    if (file.includes('Occupancy.jsx')) {
         content = content.replace(/import React, \{ useState \} from "react";\r?\n/, '');
    }
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed more imports');
