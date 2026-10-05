const fs = require('fs');
const file = 'Client/src/pages/Auth/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\) :\ \(\s*\{\/\* Main Card \*\/\}\s*<div/g,
  ') : (\n      <div'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error in Login.jsx');
