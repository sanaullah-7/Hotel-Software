const fs = require('fs');
let file = 'src/features/settings/pages/HotelProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states and ref
const stateRegex = /const \[isDragging, setIsDragging\] = useState\(false\);\n  const \[toastMessage, setToMessage\] = useState\(null\);\n  const fileInputRef = useRef\(null\);/m;
const newStates = `const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [ownerLogoPreview, setOwnerLogoPreview] = useState(() => {
    const saved = localStorage.getItem('ownerLogo');
    return saved ? { url: saved, name: 'Owner Logo', size: '' } : null;
  });
  const [isOwnerDragging, setIsOwnerDragging] = useState(false);
  const fileInputRefOwner = useRef(null);

  const handleOwnerFileSelect = (file) => {
    if (!file) return;
    if (!file.type.match('image.*')) {
      showToast('Please select a valid image file (PNG, JPG, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOwnerLogoPreview({
        url: e.target.result,
        name: file.name,
        size: \`\${(file.size / 1024).toFixed(1)} KB\`,
      });
      showToast('Owner Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };`;

content = content.replace(stateRegex, newStates);

// 2. Modify handleSave
const handleSaveRegex = /const handleSave = \(e\) => \{\n    e\.preventDefault\(\);\n    showToast\('Hotel profile saved successfully!'\);\n    setIsEditing\(false\);\n  \};/m;
const newHandleSave = `const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('fullName', formData.shayan);
    if (ownerLogoPreview && ownerLogoPreview.url) {
      localStorage.setItem('ownerLogo', ownerLogoPreview.url);
    } else {
      localStorage.removeItem('ownerLogo');
    }
    window.dispatchEvent(new Event('storage'));
    showToast('Hotel profile saved successfully!');
    setIsEditing(false);
  };`;

content = content.replace(handleSaveRegex, newHandleSave);

// 3. Add Owner Logo UI in General Information
const taglineRegex = /<FormField readOnly=\{!isEditing\}\n  label="Tagline\*"\n  name="tagline"\n  icon=\{TaglineIcon\}\n  value=\{formData\.tagline\}\n  onChange=\{handleInputChange\}\n  placeholder="e\.g\. Elegance in every stay"\n  \/>\n  <\/div>/m;
const newTaglineWithLogo = `<FormField readOnly={!isEditing}
  label="Tagline*"
  name="tagline"
  icon={TaglineIcon}
  value={formData.tagline}
  onChange={handleInputChange}
  placeholder="e.g. Elegance in every stay"
  />
  </div>

  {/* Owner Logo Upload */}
  <div className="mt-4">
    <span className="block text-sm font-semibold text-gray-700 mb-2">Owner Logo</span>
    <input
      type="file"
      ref={fileInputRefOwner}
      onChange={(e) => handleOwnerFileSelect(e.target.files[0])}
      accept="image/png, image/jpeg, image/svg+xml"
      className="hidden"
    />
    {ownerLogoPreview ? (
      <div className="border-2 border-[#008000] rounded-2xl p-4 bg-[#f8faff] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl">
        <div className="flex items-center gap-3">
          <img
            src={ownerLogoPreview.url}
            alt="Owner Logo Preview"
            className="w-14 h-14 object-cover rounded-full bg-white border border-gray-200 p-1"
          />
          <div>
            <p className="font-bold text-gray-900 text-sm">{ownerLogoPreview.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{ownerLogoPreview.size}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => isEditing && fileInputRefOwner.current?.click()}
            className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
          >
            Change Logo
          </button>
          <button type="button" onClick={() => isEditing && setOwnerLogoPreview(null)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
            title="Remove Logo"
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    ) : (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsOwnerDragging(true); }}
        onDragLeave={() => setIsOwnerDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsOwnerDragging(false); if (e.dataTransfer.files[0]) handleOwnerFileSelect(e.dataTransfer.files[0]); }}
        onClick={() => isEditing && fileInputRefOwner.current?.click()} 
        className={\`max-w-xl border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer \${
          isOwnerDragging ? 'border-[#008000] bg-[#EFF4F8]' : 'border-[#008000] bg-[#f8faff] hover:bg-[#f0f4ff]'
        }\`}
      >
        <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#008000] mx-auto flex items-center justify-center mb-2">
          <UploadIcon sx={{ fontSize: 20 }} />
        </div>
        <h4 className="font-bold text-gray-900 text-sm">Click or Drag to Upload Owner Logo</h4>
        <p className="text-xs text-gray-500 mt-0.5">SVG, PNG or JPG (recommended 400×400px, max 2MB)</p>
      </div>
    )}
  </div>`;

content = content.replace(taglineRegex, newTaglineWithLogo);

fs.writeFileSync(file, content, 'utf8');
