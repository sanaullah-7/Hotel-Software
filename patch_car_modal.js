const fs = require('fs');

const file = 'Client/src/features/car-parking/components/AddEditCarModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add carImage to initial state
content = content.replace(
  /paymentStatus: 'Pending',/g,
  `paymentStatus: 'Pending',\n    carImage: '',`
);

// 2. Add compression and upload handler
const uploadLogic = `
  const compressImage = (file, maxWidth = 400, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const compressed = await compressImage(file, 400, 0.6);
      setFormData(prev => ({ ...prev, carImage: compressed }));
    }
  };
`;

content = content.replace(
  /const handleChange = \(e\) => \{/,
  uploadLogic + '\n  const handleChange = (e) => {'
);

// 3. Add UI field
const uiField = `
          <Grid item xs={12}>
            {renderLabel('Car Image')}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="car-image-upload"
              onChange={handleImageUpload} 
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="car-image-upload"
              style={{
                width: '100%',
                border: '2px dashed #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              {formData.carImage ? (
                <img src={formData.carImage} alt="Car" style={{ maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }} />
              ) : (
                <>
                  <CameraIcon sx={{ color: '#94a3b8', fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Upload Car Image</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Click to browse</Typography>
                </>
              )}
            </label>
          </Grid>
`;

content = content.replace(
  /<Grid item xs=\{12\} sm=\{6\}>\s*\{renderLabel\('Entry Time'\)\}\s*<TextField fullWidth name="entryTime" type="time" value=\{formData\.entryTime\} onChange=\{handleChange\} size="small" \/>\s*<\/Grid>\s*<\/Grid>/,
  '<Grid item xs={12} sm={6}>\n            {renderLabel(\'Entry Time\')}\n            <TextField fullWidth name="entryTime" type="time" value={formData.entryTime} onChange={handleChange} size="small" />\n          </Grid>' + uiField + '\n        </Grid>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed AddEditCarModal.jsx');

