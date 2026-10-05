const fs = require('fs');

const file = 'Client/src/pages/Auth/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update handleRegister
const handleRegisterCode = `
  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.hotelName) {
      localStorage.setItem('hotelName', formData.hotelName);
    }
    if (formData.fullName) {
      localStorage.setItem('fullName', formData.fullName);
    }
    
    // Create new registration request
    const existingReqs = JSON.parse(localStorage.getItem('hotel_registration_requests') || '[]');
    const newReq = {
      id: 'req-' + Date.now(),
      hotelName: formData.hotelName,
      managerName: formData.fullName,
      managerEmail: formData.email,
      password: formData.password, // Only for frontend simulation
      status: 'PENDING',
      registeredAt: new Date().toISOString().split('T')[0],
      totalRooms: 100, // Default for mock
      subscriptionPlan: 'STANDARD',
      city: 'Unknown',
      phone: 'Unknown'
    };
    existingReqs.push(newReq);
    localStorage.setItem('hotel_registration_requests', JSON.stringify(existingReqs));

    // Redirect to login or dashboard
    navigate('/login', { state: { registeredEmail: formData.email } });
  };
`;

content = content.replace(
  /const handleRegister = \(e\) => \{[\s\S]*?navigate\('\/login'\);\s*\};/,
  handleRegisterCode
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Register.jsx');
