const fs = require('fs');
const file = 'Client/src/pages/Auth/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

const newSaveLogic = `
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
    
    try {
      localStorage.setItem('hotel_registration_requests', JSON.stringify(existingReqs));
    } catch (err) {
      console.warn("Storage quota exceeded, trying to free space by keeping only the latest request...");
      try {
        localStorage.setItem('hotel_registration_requests', JSON.stringify([newReq]));
      } catch (err2) {
        alert("Browser storage is completely full from previous test images/bookings. To continue testing, please clear your browser local storage (F12 -> Application -> Local Storage -> Clear).");
        return;
      }
    }

    // Redirect to login or dashboard
    navigate('/login', { state: { registeredEmail: formData.email } });
`;

content = content.replace(
  /\/\/ Create new registration request[\s\S]*?navigate\('\/login', \{ state: \{ registeredEmail: formData\.email \} \}\);/,
  newSaveLogic.trim()
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed QuotaExceededError in Register.jsx');
