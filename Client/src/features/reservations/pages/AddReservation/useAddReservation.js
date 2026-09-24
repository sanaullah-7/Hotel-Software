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

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, send to backend here
    navigate('/reservation/all');
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
