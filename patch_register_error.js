const fs = require('fs');
const file = 'Client/src/pages/Auth/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /name="email"\s*value=\{formData\.email\}\s*onChange=\{handleChange\}/,
  `name="email" value={formData.email} onChange={handleChange} error={!!emailError} helperText={emailError}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed email field in Register.jsx');
