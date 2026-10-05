const fs = require('fs');

const src = 'Client/src/features/reservations/pages/AddReservation.jsx';
const dst = 'Client/src/features/reservations/pages/EditReservation.jsx';

let content = fs.readFileSync(src, 'utf8');

// 1. Imports
content = content.replace("import { useNavigate } from'react-router-dom';", "import { useNavigate, useParams, useEffect } from 'react-router-dom';");

// 2. Function declaration
content = content.replace("export default function AddReservation() {", "export default function EditReservation() {");

// 3. Add useParams and useEffect
const hookInsertion = `
 const { id } = useParams();
 
 useEffect(() => {
   if (id) {
     const allRes = getReservations();
     const booking = allRes.find(b => String(b.id) === String(id));
     if (booking) {
       const nameParts = (booking.name || '').split(' ');
       const fName = nameParts[0];
       const lNames = nameParts.slice(1).join(' ');
       setFormData(prev => ({
         ...prev,
         firstName: fName || '',
         lastName: lNames || '',
         email: booking.email || '',
         mobile: booking.mobile || '',
         checkInDate: booking.checkIn || '',
         checkOutDate: booking.checkOut || '',
         purposeOfStay: booking.package || 'Leisure',
         paymentMethod: booking.payment || 'Credit Card'
       }));
       if (booking.avatar) {
         setGuestProfileImage(booking.avatar);
       }
     }
   }
 }, [id]);
`;
content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n" + hookInsertion);

// 4. Modify handleSave
// I'll replace everything from "const handleSave = (e) => {" up to "navigate('/reservation/all');" with the new logic.

const handleSavePattern = /const handleSave = \(e\) => \{[\s\S]*?navigate\('\/reservation\/all'\);/;
const newSave = `const handleSave = (e) => {
  e.preventDefault();
  const reservations = getReservations();
  if (!id) return;
  const selectedRoom = availableRooms.find((room) => room.id === formData.room);
  
  const updatedReservations = reservations.map(res => {
    if (String(res.id) === String(id)) {
      return {
        ...res,
        name: \`\${formData.firstName} \${formData.lastName}\`.trim() || 'Guest',
        avatar: guestProfileImage || res.avatar,
        package: formData.purposeOfStay || res.package,
        room: selectedRoom?.number || res.room,
        roomType: selectedRoom?.type || res.roomType,
        checkIn: formData.checkInDate || res.checkIn,
        checkOut: formData.checkOutDate || res.checkOut,
        payment: formData.paymentMethod ? formData.paymentMethod : res.payment,
        email: formData.email || res.email,
        mobile: formData.mobile || res.mobile,
      };
    }
    return res;
  });
  saveReservations(updatedReservations);

  if (cnicBase64) {
    const INITIAL_DOCS = [{"id":"DOC-1","formNo":"REG-2026-089","guest":"Kamran Akmal","idType":"CNIC","idNumber":"42101-1122334-1","room":"101","date":"2026-05-10","status":"Signed & Verified"}];
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
      guest: \`\${formData.firstName} \${formData.lastName}\`.trim() || 'Guest',
      idType: 'CNIC',
      idNumber: formData.idNumber || 'N/A',
      room: selectedRoom?.number || 'N/A',
      date: new Date().toISOString().split('T')[0],
      status: 'Signed & Verified',
      cnicImage: cnicBase64
    };
    localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs]));
  }

  navigate('/reservation/all');`;

content = content.replace(handleSavePattern, newSave);

// 5. Fix UI text
// Wait, AddReservation doesn't have "Add New Booking", so I'll just change "Save Booking"
content = content.replace(/Save Booking/g, "Update Booking");

fs.writeFileSync(dst, content, 'utf8');
console.log('Successfully generated EditReservation.jsx in node with regex');
