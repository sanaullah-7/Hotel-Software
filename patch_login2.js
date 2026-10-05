const fs = require('fs');
const file = 'Client/src/pages/Auth/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

const newLoginLogic = `
    if (userReq) {
      if (userReq.status === 'PENDING') {
        setAwaitingApproval(true);
        return;
      } else if (userReq.status === 'APPROVED') {
        setError('');
        // Update hotelName for Sidebar
        if (userReq.hotelName) localStorage.setItem('hotelName', userReq.hotelName);
        if (userReq.managerName) localStorage.setItem('fullName', userReq.managerName);
        
        login({
          email: userReq.managerEmail,
          role: 'Admin',
          name: userReq.managerName || 'Admin',
        });
        navigate('/dashboard');
        return;
      }
    }

    if (cleanEmail === 'admin@hotel.com' && cleanPassword === 'admin123') {
      setError('');
      localStorage.setItem('hotelName', 'Luxuria Hotel');
      login({
        email: 'admin@hotel.com',
        role: 'Admin',
        name: localStorage.getItem('fullName') || 'Admin',
      });
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };
`;

content = content.replace(
  /if \(userReq\) \{[\s\S]*?setError\('Invalid email or password'\);\s*\}\s*\};/,
  newLoginLogic.trim()
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Login.jsx');
