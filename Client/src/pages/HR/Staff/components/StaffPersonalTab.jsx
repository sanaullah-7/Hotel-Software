import React from 'react';
import {
  PersonOutlined,
  PhoneOutlined,
  EmailOutlined,
  HomeOutlined,
  TranslateOutlined,
  PublicOutlined,
  Wc,
  FavoriteBorderOutlined,
  CalendarTodayOutlined,
  ContactPhoneOutlined
} from '@mui/icons-material';

export default function StaffPersonalTab({ staff }) {
  // Compute Age from DOB if available
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const diffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(staff.dob);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Personal Demographics */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <PersonOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-900">Personal Demographics</h3>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <PersonOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Full Name
                </span>
                <span className="font-bold text-gray-800">{staff.name}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <CalendarTodayOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Date of Birth
                </span>
                <span className="font-semibold text-gray-800">
                  {staff.dob || 'Not Provided'} {age ? `(${age} years old)` : ''}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Wc sx={{ fontSize: 16 }} className="text-gray-400" /> Gender
                </span>
                <span className="font-semibold text-gray-800">{staff.gender || 'Not Specified'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <PublicOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Nationality
                </span>
                <span className="font-semibold text-gray-800">{staff.nationality || 'Not Specified'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <FavoriteBorderOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Marital Status
                </span>
                <span className="font-semibold text-gray-800">{staff.maritalStatus || 'Single'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <TranslateOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Languages Spoken
                </span>
                <span className="font-semibold text-gray-800">{staff.languages || 'English'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Details & Emergency Information */}
        <div className="space-y-5">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <PhoneOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-900">Contact Information</h3>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <PhoneOutlined sx={{ fontSize: 16 }} className="text-emerald-500" /> Mobile Phone
                </span>
                {staff.phone && staff.phone !== 'N/A' ? (
                  <a
                    href={`tel:${staff.phone}`}
                    className="font-bold text-[#1b7f43] hover:underline"
                  >
                    {staff.phone}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-400">N/A</span>
                )}
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <PhoneOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Alternative Phone
                </span>
                <span className="font-semibold text-gray-800">{staff.altPhone || 'None Provided'}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <EmailOutlined sx={{ fontSize: 16 }} className="text-rose-500" /> Email Address
                </span>
                {staff.email && staff.email !== 'N/A' ? (
                  <a
                    href={`mailto:${staff.email}`}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    {staff.email}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-400">N/A</span>
                )}
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="text-gray-500 font-medium flex items-center gap-2 shrink-0">
                  <HomeOutlined sx={{ fontSize: 16 }} className="text-blue-500" /> Residential Address
                </span>
                <span className="font-semibold text-gray-800 text-right">{staff.address || 'Address N/A'}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-gradient-to-r from-amber-50/40 via-orange-50/20 to-white rounded-2xl border border-amber-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
              <div className="flex items-center gap-2">
                <ContactPhoneOutlined className="text-amber-600" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-amber-900">Emergency Contact Person</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">
                {staff.emergencyRelation || 'Relation N/A'}
              </span>
            </div>

            {staff.emergencyName ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="text-sm font-extrabold text-gray-900">{staff.emergencyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Relationship:</span>
                  <span className="font-semibold text-gray-800">{staff.emergencyRelation || 'Family'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Contact Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900">{staff.emergencyPhone || 'N/A'}</span>
                    {staff.emergencyPhone && (
                      <a
                        href={`tel:${staff.emergencyPhone}`}
                        className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-bold flex items-center gap-1 hover:brightness-105"
                      >
                        <PhoneOutlined sx={{ fontSize: 13 }} /> Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-2">
                No emergency contact details registered for this employee yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
