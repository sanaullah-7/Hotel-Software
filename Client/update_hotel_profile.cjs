const fs = require('fs');
let file = 'src/features/settings/pages/HotelProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add isEditing state
content = content.replace(/const \[formData, setFormData\] = useState\(DEFAULT_PROFILE\);/, 'const [formData, setFormData] = useState(DEFAULT_PROFILE);\n  const [isEditing, setIsEditing] = useState(false);');

// Add Edit button to Property Details
const propertyDetailsRegex = /<h3 className="text-\[16px\] font-bold text-\[#1e293b\]">\s*Property Details\s*<\/h3>/;
const propertyDetailsReplacement = `<div className="flex items-center justify-between">
      <h3 className="text-[16px] font-bold text-[#1e293b]">Property Details</h3>
      {!isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-4 py-1.5 bg-[#008000] text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
        >
          Edit
        </button>
      )}
    </div>`;
content = content.replace(propertyDetailsRegex, propertyDetailsReplacement);

// Pass readOnly={!isEditing} to all FormFields
content = content.replace(/<FormField/g, '<FormField readOnly={!isEditing}');

// Update Save and Discard buttons to only show when isEditing
const buttonsRegex = /<div className="pt-4 flex items-center gap-3">[\s\S]*?<\/button>\s*<\/div>/;
const buttonsReplacement = `{isEditing && (
    <div className="pt-4 flex items-center gap-3">
      <button
        type="submit"
        className="px-5 py-2.5 bg-[#008000] hover:bg-green-800 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
      >
        <SaveIcon sx={{ fontSize: 18 }} />
        Save Changes
      </button>
      <button
        type="button"
        onClick={handleDiscard}
        className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <CloseIcon sx={{ fontSize: 18 }} />
        Discard
      </button>
    </div>
  )}`;
content = content.replace(buttonsRegex, buttonsReplacement);

// Update handleSave and handleDiscard to set isEditing to false
content = content.replace(/const handleSave = \(e\) => \{[\s\S]*?showToast\('Hotel profile saved successfully!'\);\s*\};/, `const handleSave = (e) => {
    e.preventDefault();
    showToast('Hotel profile saved successfully!');
    setIsEditing(false);
  };`);

content = content.replace(/const handleDiscard = \(\) => \{[\s\S]*?showToast\('Changes discarded\.'\);\s*\};/, `const handleDiscard = () => {
    setFormData(DEFAULT_PROFILE);
    setSelectedColor('#3b82f6');
    setLogoPreview(null);
    showToast('Changes discarded.');
    setIsEditing(false);
  };`);

// Make upload area conditional on isEditing
content = content.replace(/<button\s*type="button"\s*onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/, `<button type="button" onClick={() => isEditing && fileInputRef.current?.click()}`);
content = content.replace(/onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}\s*className=\{\`border-2 border-dashed/, `onClick={() => isEditing && fileInputRef.current?.click()} className={\`border-2 border-dashed`);
content = content.replace(/<button\s*type="button"\s*onClick=\{\(\) => setLogoPreview\(null\)\}/, `<button type="button" onClick={() => isEditing && setLogoPreview(null)}`);

fs.writeFileSync(file, content, 'utf8');
