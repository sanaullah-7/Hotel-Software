import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle as SuccessIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import FormField from '../components/FormField';
import { addAuditLog } from '../../audit/state/auditStore';
import '../../assigned-ui/formStyles.css';

const DEFAULT_PROFILE = {
  hotelName: 'Luxuria Resort & Spa',
  shayan: 'Shayan Ahmad',
  tagline: 'Elegance in every stay',
  email: 'contact@luxuria.com',
  phone: '+1 234 567 8900',
  website: 'www.luxuria.com',
  streetAddress: '123 Luxury Way, Paradise City',
  city: 'Paradise City',
  country: 'United States',
  description: 'A premium 5-star resort located in the heart of paradise.',
  accentColor: '#3b82f6',
};

const ACCENT_COLORS = [
  { id: 'blue', hex: '#3b82f6', bg: 'bg-[#3b82f6]' },
  { id: 'green', hex: '#00b894', bg: 'bg-[#00b894]' },
  { id: 'amber', hex: '#f59e0b', bg: 'bg-[#f59e0b]' },
  { id: 'purple', hex: '#6366f1', bg: 'bg-[#6366f1]' },
  { id: 'red', hex: '#ef4444', bg: 'bg-[#ef4444]' },
];

export default function HotelProfile() {
  const [formData, setFormData] = useState(() => {
    return {
      ...DEFAULT_PROFILE,
      hotelName: localStorage.getItem('hotelName') || DEFAULT_PROFILE.hotelName,
      shayan: localStorage.getItem('fullName') || DEFAULT_PROFILE.shayan
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  
  const [logoPreview, setLogoPreview] = useState(() => {
    const saved = localStorage.getItem('hotelLogo');
    return saved ? { url: saved, name: 'Hotel Logo', size: '' } : null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const [ownerLogoPreview, setOwnerLogoPreview] = useState(() => {
    const saved = localStorage.getItem('ownerLogo');
    return saved ? { url: saved, name: 'Owner Logo', size: '' } : null;
  });
  const [isOwnerDragging, setIsOwnerDragging] = useState(false);
  const fileInputRefOwner = useRef(null);

  const [toastMessage, setToMessage] = useState(null);

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
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
      showToast('Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleOwnerFileSelect = (file) => {
    if (!file) return;
    if (!file.type.match('image.*')) {
      showToast('Please select a valid image file (PNG, JPG, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOwnerLogoPreview({
        url: e.target.result,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
      showToast('Owner Logo uploaded successfully!');
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

  const handleOwnerDrop = (e) => {
    e.preventDefault();
    setIsOwnerDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleOwnerFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('fullName', formData.shayan);
    localStorage.setItem('hotelName', formData.hotelName);
    
    if (ownerLogoPreview && ownerLogoPreview.url) {
      localStorage.setItem('ownerLogo', ownerLogoPreview.url);
    } else {
      localStorage.removeItem('ownerLogo');
    }
    
    if (logoPreview && logoPreview.url) {
      localStorage.setItem('hotelLogo', logoPreview.url);
    } else {
      localStorage.removeItem('hotelLogo');
    }
    
    window.dispatchEvent(new Event('storage'));
    showToast('Hotel profile saved successfully!');
    addAuditLog({ module: 'Hotel Settings', action: 'Updated Hotel Profile', description: 'Hotel name, logo, or contact info was changed.', importance: 'Important' });
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setFormData(DEFAULT_PROFILE);
    setSelectedColor('#3b82f6');
    setLogoPreview(null);
    setOwnerLogoPreview(null);
    showToast('Changes discarded.');
    setIsEditing(false);
  };

  const totalFields = 9;
  const filledFields = Object.keys(DEFAULT_PROFILE).filter(
    (key) => key !== 'accentColor' && formData[key]?.toString().trim() !== ''
  ).length;
  const completionPercentage = Math.round((filledFields / totalFields) * 85);

  return (
    <div className="assigned-form-surface w-full space-y-2 pb-1 font-sans">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-[#1e293b] text-white px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <SuccessIcon sx={{ fontSize: 20, color: '#10b981' }} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#008000] flex items-center justify-center shrink-0">
            <ApartmentIcon sx={{ fontSize: 20 }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-[16px] font-bold text-[#1e293b]">Property Details</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 bg-[#008000] text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Configure your hotel's core identity, contact information, and location
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#008000] flex items-center justify-center">
                <ApartmentIcon sx={{ fontSize: 16 }} />
              </div>
              <h4 className="text-[15px] font-bold text-gray-900">General Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField readOnly={!isEditing}
                label="Hotel Name*"
                name="hotelName"
                icon={ApartmentIcon}
                value={formData.hotelName}
                onChange={handleInputChange}
                placeholder="e.g. Luxuria Resort & Spa"
              />
              <FormField readOnly={!isEditing}
                label="Hotel Owner Name"
                name="shayan"
                icon={UserIcon}
                value={formData.shayan}
                onChange={handleInputChange}
                placeholder="shayan ahmad"
              />
              <FormField readOnly={!isEditing}
                label="Tagline*"
                name="tagline"
                icon={TaglineIcon}
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g. Elegance in every stay"
              />
            </div>
            
            {/* Owner Logo Upload */}
            <div className="mt-4">
              <span className="block text-[15px] font-bold text-gray-900 mb-2">Owner profile image</span>
              <input
                type="file"
                ref={fileInputRefOwner}
                onChange={(e) => handleOwnerFileSelect(e.target.files[0])}
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
              />
              {ownerLogoPreview ? (
                <div className="border-2 border-[#008000] rounded-2xl p-4 bg-[#f8faff] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={ownerLogoPreview.url}
                      alt="Owner Logo Preview"
                      className="w-14 h-14 object-cover rounded-full bg-white border border-gray-200 p-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{ownerLogoPreview.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ownerLogoPreview.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => isEditing && fileInputRefOwner.current?.click()}
                      className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                    >
                      Change Logo
                    </button>
                    <button type="button" onClick={() => isEditing && setOwnerLogoPreview(null)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Remove Logo"
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsOwnerDragging(true); }}
                  onDragLeave={() => setIsOwnerDragging(false)}
                  onDrop={handleOwnerDrop}
                  onClick={() => isEditing && fileInputRefOwner.current?.click()} 
                  className={`max-w-xl border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
                    isOwnerDragging ? 'border-[#008000] bg-[#EFF4F8]' : 'border-[#008000] bg-[#f8faff] hover:bg-[#f0f4ff]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#008000] mx-auto flex items-center justify-center mb-2">
                    <UploadIcon sx={{ fontSize: 20 }} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Click or Drag to Upload Owner Logo</h4>
                  <p className="text-xs text-gray-500 mt-0.5">SVG, PNG or JPG (recommended 400x400px, max 2MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#008000] flex items-center justify-center">
                <EmailIcon sx={{ fontSize: 16 }} />
              </div>
              <h4 className="text-[15px] font-bold text-gray-900">Contact & Web Presence</h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField readOnly={!isEditing}
                  label="Email Address*"
                  name="email"
                  icon={EmailIcon}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@luxuria.com"
                />
                <FormField readOnly={!isEditing}
                  label="Phone Number*"
                  name="phone"
                  icon={PhoneIcon}
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <FormField readOnly={!isEditing}
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#008000] flex items-center justify-center">
                <LocationIcon sx={{ fontSize: 16 }} />
              </div>
              <h4 className="text-[15px] font-bold text-gray-900">Address & Location</h4>
            </div>

            <div className="space-y-4">
              <div>
                <FormField readOnly={!isEditing}
                  label="Street Address*"
                  name="streetAddress"
                  icon={LocationIcon}
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="123 Luxury Way, Paradise City"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField readOnly={!isEditing}
                  label="City*"
                  name="city"
                  icon={ApartmentIcon}
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Paradise City"
                />
                <FormField readOnly={!isEditing}
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#008000] flex items-center justify-center">
                <DescriptionIcon sx={{ fontSize: 16 }} />
              </div>
              <h4 className="text-[15px] font-bold text-gray-900">Property Narrative</h4>
            </div>

            <div>
              <FormField readOnly={!isEditing}
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

          <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm p-3 sm:p-4 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept="image/png, image/jpeg, image/svg+xml"
              className="hidden"
            />
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
                  <button type="button" onClick={() => isEditing && fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Change Logo
                  </button>
                  <button type="button" onClick={() => isEditing && setLogoPreview(null)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
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
                onClick={() => isEditing && fileInputRef.current?.click()} 
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
                  isDragging ? 'border-[#008000] bg-[#EFF4F8]' : 'border-[#008000] bg-[#f8faff] hover:bg-[#f0f4ff]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#ede9fe] text-[#008000] mx-auto flex items-center justify-center mb-2">
                  <UploadIcon sx={{ fontSize: 20 }} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Click or Drag to Upload Hotel Logo</h4>
                <p className="text-xs text-gray-500 mt-0.5">SVG, PNG or JPG (recommended 400x400px, max 2MB)</p>
              </div>
            )}
          </div>

          {isEditing && (
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
          )}
        </form>
      </div>
    </div>
  );
}
