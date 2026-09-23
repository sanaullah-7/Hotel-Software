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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
        avatar: 'https://i.pravatar.cc/150?img=' + (Math.floor(Math.random() * 70) + 1),
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
