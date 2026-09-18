const fs = require('fs');

const file = 'src/pages/Rooms/Rooms.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Ensure PhoneOutlined is imported
    if (!content.includes('PhoneOutlined')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'@mui\/icons-material'/g, function(match, p1) {
            let imports = p1.split(',').map(s => s.trim());
            if (!imports.includes('PhoneOutlined')) imports.push('PhoneOutlined');
            return "import { " + imports.join(', ') + " } from '@mui/icons-material';";
        });
    }

    // 2. Replace the emoji span with the icon
    // We are looking for something like: <span className="text-[#10b981] text-[16px]">??</span> or the corrupted 
    // version <span className="text-[#10b981] text-[16px]">dY"z</span>
    
    // First, let's use a regex that captures the span specifically
    content = content.replace(/<span className="text-\[\#10b981\] text-\[16px\]">.*?<\/span>\s*\{room\.mobile\}/g, '<PhoneOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> {room.mobile}');
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
}
