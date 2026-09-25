const fs = require('fs');

// HOTEL PROFILE
let content = fs.readFileSync('src/features/settings/pages/HotelProfile.jsx', 'utf8');

if (!content.includes('ownerLogoPreview')) {
  // Inject state
  content = content.replace(
    'const fileInputRef = useRef(null);',
    `const fileInputRef = useRef(null);
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
  };`
  );

  // Inject handleSave logic
  content = content.replace(
    /const handleSave = \(e\) => \{\s*e\.preventDefault\(\);\s*showToast\('Hotel profile saved successfully!'\);\s*setIsEditing\(false\);\s*\};/,
    `const handleSave = (e) => {
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
  };`
  );

  // Inject owner logo UI
  const taglineStr = `  placeholder="e.g. Elegance in every stay"\n  />\n  </div>`;
  content = content.replace(
    taglineStr,
    `  placeholder="e.g. Elegance in every stay"
  />
  </div>

  {/* Owner Logo Upload */}
  <div className="mt-4">
    <span className="block text-[15px] font-bold text-gray-900 mb-2">Owner Logo</span>
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
        onDrop={(e) => { e.preventDefault(); setIsOwnerDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleOwnerFileSelect(e.dataTransfer.files[0]); }}
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
  </div>`
  );
  
  fs.writeFileSync('src/features/settings/pages/HotelProfile.jsx', content, 'utf8');
}

// TOPBAR
let topbar = fs.readFileSync('src/layouts/DashboardLayout/Topbar.jsx', 'utf8');
if (!topbar.includes('profileLogo')) {
  topbar = topbar.replace(
    /const \[profileAnchorEl, setProfileAnchorEl\] = useState\(null\);\n  const isProfileMenuOpen = Boolean\(profileAnchorEl\);/,
    `const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  
  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'Admin');
  const [profileLogo, setProfileLogo] = useState(localStorage.getItem('ownerLogo') || null);

  React.useEffect(() => {
    const handleStorage = () => {
      setProfileName(localStorage.getItem('fullName') || 'Admin');
      setProfileLogo(localStorage.getItem('ownerLogo') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);`
  );
  
  topbar = topbar.replace(
    /<Avatar\n\s*src=\{`https:\/\/ui-avatars\.com\/api\/\?name=\$\{localStorage\.getItem\('fullName'\) \|\| 'Admin'\}&background=random`\}\n\s*alt="admin"\n\s*sx=\{\{ width: 32, height: 32 \}\}\n\s*\/>\n\s*<Typography variant="body2" sx=\{\{ fontWeight: 500, color: 'text\.primary' \}\}>\n\s*\{localStorage\.getItem\('fullName'\) \|\| 'Admin'\}\n\s*<\/Typography>/,
    `<Avatar
              src={profileLogo || \`https://ui-avatars.com/api/?name=\${profileName}&background=random\`}
              alt="admin"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {profileName}
            </Typography>`
  );
  
  fs.writeFileSync('src/layouts/DashboardLayout/Topbar.jsx', topbar, 'utf8');
}
