const fs = require('fs');

let profile = fs.readFileSync('src/features/settings/pages/HotelProfile.jsx', 'utf8');

profile = profile.replace(
  'const [formData, setFormData] = useState(DEFAULT_PROFILE);',
  `const [formData, setFormData] = useState(() => {
    return {
      ...DEFAULT_PROFILE,
      hotelName: localStorage.getItem('hotelName') || DEFAULT_PROFILE.hotelName,
      shayan: localStorage.getItem('fullName') || DEFAULT_PROFILE.shayan
    };
  });`
);

profile = profile.replace(
  'const [logoPreview, setLogoPreview] = useState(null);',
  `const [logoPreview, setLogoPreview] = useState(() => {
    const saved = localStorage.getItem('hotelLogo');
    return saved ? { url: saved, name: 'Hotel Logo', size: '' } : null;
  });`
);

fs.writeFileSync('src/features/settings/pages/HotelProfile.jsx', profile, 'utf8');
