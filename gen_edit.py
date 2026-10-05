import os

src = 'Client/src/features/reservations/pages/AddReservation.jsx'
dst = 'Client/src/features/reservations/pages/EditReservation.jsx'

with open(src, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { useNavigate } from'react-router-dom';", "import { useNavigate, useParams } from 'react-router-dom';\nimport { useEffect } from 'react';")

# 2. Function declaration
content = content.replace("export default function AddReservation() {", "export default function EditReservation() {")

# 3. Add useParams and useEffect
hook_insertion = """
 const { id } = useParams();
 
 useEffect(() => {
   if (id) {
     const allRes = getReservations();
     const booking = allRes.find(b => String(b.id) === String(id));
     if (booking) {
       const [fName, ...lNames] = (booking.name || '').split(' ');
       setFormData(prev => ({
         ...prev,
         firstName: fName || '',
         lastName: lNames.join(' ') || '',
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
"""
content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n" + hook_insertion)

# 4. Modify handleSave
save_replacement = """
  e.preventDefault();
  const reservations = getReservations();
  if (!id) return;
  const nextId = id;
  const selectedRoom = availableRooms.find((room) => room.id === formData.room);
  
  const updatedReservations = reservations.map(res => {
    if (String(res.id) === String(id)) {
      return {
        ...res,
        name: `${formData.firstName} ${formData.lastName}`.trim() || 'Guest',
        avatar: guestProfileImage || res.avatar,
        package: formData.purposeOfStay || res.package,
        room: selectedRoom?.number || res.room,
        roomType: selectedRoom?.type || res.roomType,
        checkIn: formData.checkInDate || res.checkIn,
        checkOut: formData.checkOutDate || res.checkOut,
        payment: formData.paymentMethod ? 'Pending' : res.payment,
        email: formData.email || res.email,
        mobile: formData.mobile || res.mobile,
      };
    }
    return res;
  });
  saveReservations(updatedReservations);

  if (cnicBase64) {
    const INITIAL_DOCS = [{"id":"DOC-1","formNo":"REG-2026-089","guest":"Kamran Akmal","idType":"CNIC","idNumber":"42101-1122334-1","room":"101","date":"2026-05-10","status":"Signed & Verified"}]; // Shortened
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
      guest: `${formData.firstName} ${formData.lastName}`.trim() || 'Guest',
      idType: 'CNIC',
      idNumber: formData.idNumber || 'N/A',
      room: selectedRoom?.number || 'N/A',
      date: new Date().toISOString().split('T')[0],
      status: 'Signed & Verified',
      cnicImage: cnicBase64
    };
    localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs]));
  }

  navigate('/reservation/all');
"""
content = content.replace(content[content.find("const handleSave = (e) => {") + 27 : content.find("};", content.find("const handleSave = (e) => {")) + 2], save_replacement)

# 5. Fix UI text
content = content.replace(">Add New Booking</h2>", ">Edit Booking</h2>")
content = content.replace("Save Booking\n </button>", "Update Booking\n </button>")

with open(dst, 'w') as f:
    f.write(content)
print('Successfully generated EditReservation.jsx')
