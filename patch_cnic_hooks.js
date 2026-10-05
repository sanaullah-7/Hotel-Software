const fs = require('fs');

const INITIAL_DOCS = [
  { id: "DOC-1", formNo: "REG-2026-089", guest: "Kamran Akmal", idType: "CNIC", idNumber: "42101-1122334-1", room: "101", date: "2026-05-10", status: "Signed & Verified" },
  { id: "DOC-2", formNo: "REG-2026-088", guest: "Cara Stevens", idType: "Passport", idNumber: "USA-9988221", room: "102", date: "2026-05-01", status: "Signed & Verified" },
  { id: "DOC-3", formNo: "REG-2026-087", guest: "Airi Satou", idType: "Passport", idNumber: "JPN-4455112", room: "105", date: "2026-05-02", status: "Pending Signature" },
  { id: "DOC-4", formNo: "REG-2026-086", guest: "Mahira Khan", idType: "CNIC", idNumber: "42201-6655443-2", room: "201", date: "2026-05-09", status: "Signed & Verified" },
  { id: "DOC-5", formNo: "REG-2026-085", guest: "Jens Brincker", idType: "Passport", idNumber: "GER-8833119", room: "302", date: "2026-05-03", status: "Signed & Verified" },
  { id: "DOC-6", formNo: "REG-2026-001", guest: "John Smith", idType: "Passport", idNumber: "USA-4491028", room: "101", date: "2026-05-20", status: "Signed & Verified" },
  { id: "DOC-7", formNo: "REG-2026-002", guest: "Sarah Johnson", idType: "Passport", idNumber: "UK-8891002", room: "205", date: "2026-05-19", status: "Signed & Verified" }
];

const files = [
    'Client/src/features/reservations/components/AddReservationForm/useAddReservation.js',
    'Client/src/features/reservations/pages/AddReservation/useAddReservation.js'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // 1. Add cnicBase64 state and logic
        if (!content.includes('cnicBase64')) {
            content = content.replace(
                /const handleFileChange = \(e\) => {[\s\S]*?};\s*/,
                `const [cnicBase64, setCnicBase64] = useState(null);\n  const handleFileChange = (e) => {\n    if (e.target.files && e.target.files.length > 0) {\n      const file = e.target.files[0];\n      setSelectedFile(file);\n      const reader = new FileReader();\n      reader.onloadend = () => setCnicBase64(reader.result);\n      reader.readAsDataURL(file);\n    }\n  };\n\n  `
            );
        }
        
        // 2. Export cnicBase64
        if (!content.includes('cnicBase64,')) {
            content = content.replace(
                /selectedFile,/,
                `selectedFile,\n    cnicBase64,`
            );
        }

        // 3. Save logic
        if (!content.includes('hotel_registration_forms')) {
            const savePatch = `
        if (cnicBase64) {
          const INITIAL_DOCS = ${JSON.stringify(INITIAL_DOCS)};
          let storedDocs = [];
          try {
            const rawDocs = localStorage.getItem('hotel_registration_forms');
            storedDocs = rawDocs ? JSON.parse(rawDocs) : INITIAL_DOCS;
          } catch {
            storedDocs = INITIAL_DOCS;
          }
          const newDoc = {
            id: 'DOC-' + Date.now(),
            formNo: 'REG-' + Date.now(),
            guest: newBooking.name,
            idType: 'CNIC',
            idNumber: formData.idNumber || 'N/A',
            room: formData.room || 'N/A',
            date: new Date().toISOString().split('T')[0],
            status: 'Signed & Verified',
            cnicImage: cnicBase64
          };
          localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs]));
        }

        navigate`;
            
            content = content.replace(/\n\s*navigate/, savePatch);
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log('Patched hook:', file);
    }
});
