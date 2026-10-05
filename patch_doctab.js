const fs = require('fs');

const file = 'Client/src/features/guests/components/tabs/DocumentsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('viewingDoc.cnicImage')) {
    const patch = `
              {viewingDoc.notes && (
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                  <span className="text-gray-500 font-bold block mb-1">Notes:</span>
                  <p className="text-gray-700">{viewingDoc.notes}</p>
                </div>
              )}

              {viewingDoc.cnicImage && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                  <span className="text-gray-500 font-bold block mb-2 w-full text-left">Document Image:</span>
                  <img src={viewingDoc.cnicImage} alt="CNIC Document" className="max-h-64 object-contain rounded border shadow-sm" />
                </div>
              )}`;
              
    content = content.replace(
        /{\s*viewingDoc\.notes && \([\s\S]*?<\/div>\s*\)\s*}/,
        patch
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched DocumentsTab.jsx');
} else {
    console.log('Already patched DocumentsTab.jsx');
}
