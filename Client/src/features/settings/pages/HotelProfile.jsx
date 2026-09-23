import React, { useState, useRef } from'react';
import {
 HomeOutlined as HomeIcon,
 Apartment as ApartmentIcon,
 AutoAwesome as TaglineIcon,
 Email as EmailIcon,
 Phone as PhoneIcon,
 Language as WebsiteIcon,
 LocationOn as LocationIcon,
 Public as CountryIcon,
 Description as DescriptionIcon,
 Save as SaveIcon,
 Close as CloseIcon,
 CloudUpload as UploadIcon,
 Check as CheckIcon,
 Verified as VerifiedIcon,
 LightbulbOutlined as LightbulbIcon,
 Delete as DeleteIcon,
 CheckCircle as SuccessIcon
} from'@mui/icons-material';
import FormField from '../components/FormField';
import '../../assigned-ui/formStyles.css';

const DEFAULT_PROFILE = {
 hotelName:'Luxuria Resort & Spa',
 tagline:'Elegance in every stay',
 email:'contact@luxuria.com',
 phone:'+1 234 567 8900',
 website:'www.luxuria.com',
 streetAddress:'123 Luxury Way, Paradise City',
 city:'Paradise City',
 country:'United States',
 description:'A premium 5-star resort located in the heart of paradise.',
 accentColor:'#3b82f6',
};

const ACCENT_COLORS = [
 { id:'blue', hex:'#3b82f6', bg:'bg-[#3b82f6]' },
 { id:'green', hex:'#00b894', bg:'bg-[#00b894]' },
 { id:'amber', hex:'#f59e0b', bg:'bg-[#f59e0b]' },
 { id:'purple', hex:'#6366f1', bg:'bg-[#6366f1]' },
 { id:'red', hex:'#ef4444', bg:'bg-[#ef4444]' },
];


export default function HotelProfile() {
 const [formData, setFormData] = useState(DEFAULT_PROFILE);
 const [selectedColor, setSelectedColor] = useState('#3b82f6');
 const [logoPreview, setLogoPreview] = useState(null);
 const [isDragging, setIsDragging] = useState(false);
 const [toastMessage, setToMessage] = useState(null);
 const fileInputRef = useRef(null);

 const showToast = (message) => {
 setToMessage(message);
 setTimeout(() => {
 setToMessage(null);
 }, 3500);
 };

 const handleInputChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleFileSelect = (file) => {
 if (!file) return;
 if (!file.type.match('image.*')) {
 showToast('Please select a valid image file (PNG, JPG, SVG).');
 return;
 }
 const reader = new FileReader();
 reader.onload = (e) => {
 setLogoPreview({
 url: e.target.result,
 name: file.name,
 size:`${(file.size / 1024).toFixed(1)} KB`,
 });
 showToast('Logo uploaded successfully!');
 };
 reader.readAsDataURL(file);
 };

 const handleDragOver = (e) => {
 e.preventDefault();
 setIsDragging(true);
 };

 const handleDragLeave = () => {
 setIsDragging(false);
 };

 const handleDrop = (e) => {
 e.preventDefault();
 setIsDragging(false);
 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 handleFileSelect(e.dataTransfer.files[0]);
 }
 };

 const handleSave = (e) => {
 e.preventDefault();
 // Simulate save
 showToast('Hotel profile saved successfully!');
 };

 const handleDiscard = () => {
 setFormData(DEFAULT_PROFILE);
 setSelectedColor('#3b82f6');
 setLogoPreview(null);
 showToast('Changes discarded.');
 };

 // Calculate profile completion percentage
 const totalFields = 9;
 const filledFields = Object.keys(DEFAULT_PROFILE).filter(
 (key) => key !=='accentColor' && formData[key]?.toString().trim() !==''
 ).length;
 const completionPercentage = Math.round((filledFields / totalFields) * 85);

 return (
 <div className="assigned-form-surface w-full space-y-2 pb-1 font-sans">
 {/* Toast Notification */}
 {toastMessage && (
 <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-[#1e293b] text-white px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
 <SuccessIcon sx={{ fontSize: 20, color:'#10b981' }} />
 <span className="text-sm font-medium">{toastMessage}</span>
 </div>
 )}

 

 {/* 2. Main Form Card: Property Details */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-4">
 {/* Card Header */}
 <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
 <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#008000] flex items-center justify-center shrink-0">
 <ApartmentIcon sx={{ fontSize: 20 }} />
 </div>
 <div>
 <h3 className="text-[16px] font-bold text-[#1e293b]">
 Property Details
 </h3>
 <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
 Configure your hotel's core identity, contact information, and location
 </p>
 </div>
 </div>

 <form onSubmit={handleSave} className="space-y-4 mt-3">
 {/* Section 1: General Information */}
 <div>
 <div className="flex items-center gap-2 mb-3">
 <div className="w-7 h-7 rounded-lg bg-[#ECFDF5]  text-[#008000]  flex items-center justify-center">
 <ApartmentIcon sx={{ fontSize: 16 }} />
 </div>
 <h4 className="text-[15px] font-bold text-gray-900">
 General Information
 </h4>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 label="Hotel Name*"
 name="hotelName"
 icon={ApartmentIcon}
 value={formData.hotelName}
 onChange={handleInputChange}
 placeholder="e.g. Luxuria Resort & Spa"
 />
 <FormField
 label="Tagline*"
 name="tagline"
 icon={TaglineIcon}
 value={formData.tagline}
 onChange={handleInputChange}
 placeholder="e.g. Elegance in every stay"
 />
 </div>
 </div>

 <div className="border-t border-gray-100 pt-6">
 {/* Section 2: Contact & Web Presence */}
 <div className="flex items-center gap-2 mb-4">
 <div className="w-7 h-7 rounded-lg bg-[#ECFDF5]  text-[#008000] flex items-center justify-center">
 <EmailIcon sx={{ fontSize: 16 }} />
 </div>
 <h4 className="text-[15px] font-bold text-gray-900">
 Contact & Web Presence
 </h4>
 </div>

 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 label="Email Address*"
 name="email"
 icon={EmailIcon}
 value={formData.email}
 onChange={handleInputChange}
 placeholder="contact@luxuria.com"
 />
 <FormField
 label="Phone Number*"
 name="phone"
 icon={PhoneIcon}
 value={formData.phone}
 onChange={handleInputChange}
 placeholder="+1 234 567 8900"
 />
 </div>

 <div>
 <FormField
 label="Website URL"
 name="website"
 icon={WebsiteIcon}
 value={formData.website}
 onChange={handleInputChange}
 placeholder="www.luxuria.com"
 />
 </div>
 </div>
 </div>

 <div className="border-t border-gray-100 pt-6">
 {/* Section 3: Address & Location */}
 <div className="flex items-center gap-2 mb-4">
 <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
 <LocationIcon sx={{ fontSize: 16 }} />
 </div>
 <h4 className="text-[15px] font-bold text-gray-900">
 Address & Location
 </h4>
 </div>

 <div className="space-y-4">
 <div>
 <FormField
 label="Street Address*"
 name="streetAddress"
 icon={LocationIcon}
 value={formData.streetAddress}
 onChange={handleInputChange}
 placeholder="123 Luxury Way, Paradise City"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <FormField
 label="City*"
 name="city"
 icon={ApartmentIcon}
 value={formData.city}
 onChange={handleInputChange}
 placeholder="Paradise City"
 />
 <FormField
 label="Country*"
 name="country"
 icon={CountryIcon}
 value={formData.country}
 onChange={handleInputChange}
 placeholder="United States"
 />
 </div>
 </div>
 </div>

 <div className="border-t border-gray-100 pt-6">
 {/* Section 4: Property Narrative */}
 <div className="flex items-center gap-2 mb-4">
 <div className="w-7 h-7 rounded-lg bg-[#ECFDF5]  text-[#008000] flex items-center justify-center">
 <DescriptionIcon sx={{ fontSize: 16 }} />
 </div>
 <h4 className="text-[15px] font-bold text-gray-900">
 Property Narrative
 </h4>
 </div>

 <div>
 <FormField
 label="Hotel Description*"
 name="description"
 value={formData.description}
 onChange={handleInputChange}
 multiline={true}
 rows={4}
 placeholder="Write a brief overview of your hotel property..."
 />
 </div>
 </div>

 {/* Action Buttons */}
 <div className="pt-4 flex items-center gap-3">
 <button
 type="submit"
 className="px-5 py-2.5 bg-[#008000] hover:bg-green-800 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
 >
 <SaveIcon sx={{ fontSize: 18 }} />
 Save Changes
 </button>
 <button
 type="button"
 onClick={handleDiscard}
 className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 Discard
 </button>
 </div>
 </form>
 </div>

 {/* 3. Branding & Media Card */}
 <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-4 space-y-3">
 {/* Hidden File Input */}
 <input
 type="file"
 ref={fileInputRef}
 onChange={(e) => handleFileSelect(e.target.files[0])}
 accept="image/png, image/jpeg, image/svg+xml"
 className="hidden"
 />

 {/* Drag and Drop Upload Area */}
 {logoPreview ? (
 <div className="border-2 border-[#818cf8] rounded-2xl p-4 bg-[#f8faff] flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <img
 src={logoPreview.url}
 alt="Hotel Logo Preview"
 className="w-14 h-14 object-contain rounded-xl bg-white border border-gray-200 p-1"
 />
 <div>
 <p className="font-bold text-gray-900 text-sm">{logoPreview.name}</p>
 <p className="text-xs text-gray-500 mt-0.5">{logoPreview.size}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
 >
 Change Logo
 </button>
 <button
 type="button"
 onClick={() => setLogoPreview(null)}
 className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
 title="Remove Logo"
 >
 <DeleteIcon sx={{ fontSize: 18 }} />
 </button>
 </div>
 </div>
 ) : (
 <div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => fileInputRef.current?.click()}
 className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
 isDragging
 ?'border-[#008000] bg-[#EFF4F8]'
 :'border-[#008000] bg-[#f8faff] hover:bg-[#f0f4ff]'
 }`}
 >
 <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#008000] mx-auto flex items-center justify-center mb-2">
 <UploadIcon sx={{ fontSize: 20 }} />
 </div>
 <h4 className="font-bold text-gray-900 text-sm">
 Click or Drag to Upload Logo
 </h4>
 <p className="text-xs text-gray-500 mt-0.5">
 SVG, PNG or JPG (recommended 400×400px, max 2MB)
 </p>
 </div>
 )}

 {/* Brand Accent Color Section */}
 {/* <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <span className="font-bold text-sm text-gray-900">
 Brand Accent Color
 </span>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2">
 {ACCENT_COLORS.map((color) => {
 const isSelected = selectedColor === color.hex;
 return (
 <button
 key={color.id}
 type="button"
 onClick={() => setSelectedColor(color.hex)}
 className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center cursor-pointer transition-transform hover:scale-105 relative ${
 isSelected ?'ring-2 ring-offset-2 ring-[#3b82f6]' :''
 }`}
 >
 {isSelected && (
 <CheckIcon sx={{ fontSize: 18, color:'#ffffff' }} />
 )}
 </button>
 );
 })}
 </div>
 <span className="text-xs font-mono text-gray-500 ml-2">
 {selectedColor}
 </span>
 </div>
 </div> */}

 {/* Profile Completion Section */}
 <div className="bg-[#f0fdf4]/50 border border-green-100 rounded-2xl p-6 mt-4">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[#d1fae5] text-[#10b981] flex items-center justify-center shrink-0">
 <VerifiedIcon sx={{ fontSize: 22 }} />
 </div>
 <div>
 <h4 className="font-bold text-gray-900 text-sm sm:text-base">
 Profile Completion
 </h4>
 <p className="text-xs text-gray-500 mt-0.5">
 Profile is ready for online bookings
 </p>
 </div>
 </div>
 <div className="text-lg sm:text-xl font-extrabold text-[#10b981]">
 {completionPercentage}%
 </div>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-4 mb-3">
 <div
 className="h-full bg-[#008000] rounded-full transition-all duration-300"
 style={{ width:`${completionPercentage}%` }}
 ></div>
 </div>

 {/* Alert Banner */}
 <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#92400e]">
 <LightbulbIcon sx={{ fontSize: 18, color:'#d97706' }} className="shrink-0" />
 <span>
 Add social media channels and virtual tour to reach 100%.
 </span>
 </div>
 </div>
 </div>



 </div>
 );
}
