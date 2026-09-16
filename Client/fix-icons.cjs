const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Match: import { Icon1, Icon2 as IconAlias } from '@mui/icons-material';
      const regex = /import\s+\{([^}]+)\}\s+from\s+['"]@mui\/icons-material['"];?/g;
      
      let modified = false;
      content = content.replace(regex, (match, importsStr) => {
        modified = true;
        const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
        const newImports = imports.map(imp => {
          let originalName = imp;
          let localName = imp;
          
          if (imp.includes(' as ')) {
            const parts = imp.split(' as ');
            originalName = parts[0].trim();
            localName = parts[1].trim();
          }
          
          return `import ${localName} from '@mui/icons-material/${originalName}';`;
        });
        return newImports.join('\n');
      });
      
      if (modified) {
        console.log(`Fixed: ${fullPath}`);
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
