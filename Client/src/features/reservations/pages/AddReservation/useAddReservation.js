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

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, send to backend here
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
