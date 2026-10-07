const fs = require('fs');
const path = require('path');

function refactorStore(filePath, eventName) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace localStorage logic with memory array
  let newContent = content;
  
  // Remove INITIAL arrays imports and definitions
  newContent = newContent.replace(/export const INITIAL_[a-zA-Z0-9_]+\s*=\s*\[[\s\S]*?\];/g, '');
  
  // Replace read function
  newContent = newContent.replace(/function read.*?\{\s*try[\s\S]*?catch[\s\S]*?return \[\];\s*\}/g, 'let memoryCache = []; function readData() { return memoryCache; }');
  newContent = newContent.replace(/function read.*?\{\s*try[\s\S]*?catch[\s\S]*?return INITIAL_.*?;\s*\}/g, 'let memoryCache = []; function readData() { return memoryCache; }');
  
  // Replace get functions 
  newContent = newContent.replace(/export const getRooms = \(\) => read.*?/g, 'export const getRooms = () => memoryCache;');
  newContent = newContent.replace(/export const getGuests = \(\) => read.*?/g, 'export const getGuests = () => memoryCache;');
  newContent = newContent.replace(/export const getReservations = \(\) => read.*?/g, 'export const getReservations = () => memoryCache;');
  
  // Replace save functions
  newContent = newContent.replace(/function save.*?\(.*?\) \{\s*assertValidStoredArray\(\);\s*try[\s\S]*?catch[\s\S]*?window.dispatchEvent/g, 'function saveData(data) { memoryCache = data; window.dispatchEvent');
  newContent = newContent.replace(/function save.*?\((.*?)\) \{\s*assertValidStoredArray\(\);\s*localStorage\.setItem\(.*?\);\s*window\.dispatchEvent\(new Event\((.*?)\)\);\s*\}/g, 'function saveData(data) { memoryCache = data; window.dispatchEvent(new Event()); }');
  
  // Since regex might be tricky, let's just write the core functions manually
  fs.writeFileSync(filePath + '.backup', newContent);
}

// Actually, regex is too brittle. I will just overwrite the exact functions in the files using string replacement.
