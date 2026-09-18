const fs = require('fs');
let content = fs.readFileSync('Client/vite.config.js', 'utf8');

const replacement = `  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },`;

content = content.replace(/optimizeDeps: \{[\s\S]*?esbuildOptions: \{[\s\S]*?\},[\s\S]*?\},/g, replacement);
fs.writeFileSync('Client/vite.config.js', content, 'utf8');
