import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registeredGuests } from './constants';

export function useAddReservation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    mobile: '',
    city: '',
    idNumber: '',
    nationality: '',
    
    checkInDate: '2026-09-11',
    checkOutDate: '2026-09-16',
    room: '',
    totalPerson: '',
    numberOfRooms: '1',
    purposeOfStay: '',

    paymentMethod: '',
    discountCode: '',
    bookingReference: 'BK362096OZ10IX',
    emergencyContactName: '',
    emergencyContactPhone: '',

    address: '',
    specialRequests: '',
    note: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [cnicBase64, setCnicBase64] = useState(null);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCnicBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGuestSelect = (e) => {
    const selectedId = e.target.value;
    const guest = registeredGuests.find(g => g.id === selectedId);
    if (guest) {
      setFormData(prev => ({
        ...prev,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        gender: guest.gender,
        mobile: guest.mobile,
        city: guest.city,
        idNumber: guest.idNumber,
        nationality: guest.nationality
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const initialBookings = [
    { id: 1, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=11', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/25/2023', checkOut: '02/28/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
    { id: 2, name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=5', package: 'Business', roomType: 'Super Delux', status: 'Booked', checkIn: '02/12/2023', checkOut: '02/15/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
    { id: 3, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=12', package: 'All inclusive', roomType: 'Super Delux', status: 'CheckIn', checkIn: '02/25/2023', checkOut: '02/26/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
    { id: 4, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=33', package: 'Business', roomType: 'Delux', status: 'Cancelled', checkIn: '02/21/2023', checkOut: '02/23/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
    { id: 5, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=44', package: 'All inclusive', roomType: 'Vila', status: 'CheckOut', checkIn: '02/16/2023', checkOut: '02/19/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
    { id: 6, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=55', package: 'Wedding', roomType: 'Double', status: 'Booked', checkIn: '02/11/2023', checkOut: '02/14/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
    { id: 7, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=56', package: 'Business', roomType: 'Single', status: 'Booked', checkIn: '02/27/2023', checkOut: '02/28/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
    { id: 8, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=34', package: 'All inclusive', roomType: 'Delux', status: 'Booked', checkIn: '02/17/2023', checkOut: '02/20/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
    { id: 9, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=45', package: 'Wedding', roomType: 'Delux', status: 'CheckOut', checkIn: '02/07/2023', checkOut: '02/10/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
    { id: 10, name: 'Pooja Patel', avatar: 'https://i.pravatar.cc/150?img=22', package: 'Business', roomType: 'Super Delux', status: 'Cancelled', checkIn: '02/09/2023', checkOut: '02/12/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
];

  const handleSave = (e) => {
    e.preventDefault();
    try {
      // Generate dates safely
      let checkInStr = 'N/A';
      let checkOutStr = 'N/A';
      try {
        checkInStr = formData.checkInDate ? new Date(formData.checkInDate).toLocaleDateString() : new Date().toLocaleDateString();
        checkOutStr = formData.checkOutDate ? new Date(formData.checkOutDate).toLocaleDateString() : new Date().toLocaleDateString();
      } catch(err) {
        console.error('Date parsing error', err);
      }

      const newBooking = {
        id: Date.now(), 
        name: ((formData.firstName || '') + ' ' + (formData.lastName || '')).trim() || 'Guest',
        avatar: guestProfileImage || 'https://i.pravatar.cc/150?img=' + (Math.floor(Math.random() * 70) + 1),
        package: 'Standard', 
        roomType: formData.room || 'Delux',
        status: 'Booked',
        checkIn: checkInStr,
        checkOut: checkOutStr,
        payment: formData.paymentMethod || 'Paid',
        email: formData.email || 'N/A',
        mobile: formData.mobile || 'N/A'
      };

      const saved = localStorage.getItem('hotel_all_bookings');
      let existingBookings = initialBookings;
      if (saved) {
        try {
          existingBookings = JSON.parse(saved);
        } catch (err) {}
      }
      
      existingBookings = [newBooking, ...existingBookings];
      localStorage.setItem('hotel_all_bookings', JSON.stringify(existingBookings));

      alert('Reservation saved successfully! Redirecting...');
        if (cnicBase64) {
          const INITIAL_DOCS = [{"id":"DOC-1","formNo":"REG-2026-089","guest":"Kamran Akmal","idType":"CNIC","idNumber":"42101-1122334-1","room":"101","date":"2026-05-10","status":"Signed & Verified"},{"id":"DOC-2","formNo":"REG-2026-088","guest":"Cara Stevens","idType":"Passport","idNumber":"USA-9988221","room":"102","date":"2026-05-01","status":"Signed & Verified"},{"id":"DOC-3","formNo":"REG-2026-087","guest":"Airi Satou","idType":"Passport","idNumber":"JPN-4455112","room":"105","date":"2026-05-02","status":"Pending Signature"},{"id":"DOC-4","formNo":"REG-2026-086","guest":"Mahira Khan","idType":"CNIC","idNumber":"42201-6655443-2","room":"201","date":"2026-05-09","status":"Signed & Verified"},{"id":"DOC-5","formNo":"REG-2026-085","guest":"Jens Brincker","idType":"Passport","idNumber":"GER-8833119","room":"302","date":"2026-05-03","status":"Signed & Verified"},{"id":"DOC-6","formNo":"REG-2026-001","guest":"John Smith","idType":"Passport","idNumber":"USA-4491028","room":"101","date":"2026-05-20","status":"Signed & Verified"},{"id":"DOC-7","formNo":"REG-2026-002","guest":"Sarah Johnson","idType":"Passport","idNumber":"UK-8891002","room":"205","date":"2026-05-19","status":"Signed & Verified"}];
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
            guest: newBooking.name,
            idType: 'CNIC',
            idNumber: formData.idNumber || 'N/A',
            room: formData.room || 'N/A',
            date: new Date().toISOString().split('T')[0],
            status: 'Signed & Verified',
            cnicImage: cnicBase64
          };
          localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs]));
        }

        navigate('/reservation/all');
    } catch (err) {
      alert('Error saving: ' + err.message);
    }
  };

  return {
    navigate,
    formData,
    selectedFile,
    fileInputRef,
    handleFileChange,
    handleGuestSelect,
    handleChange,
    handleSave
  };
}
