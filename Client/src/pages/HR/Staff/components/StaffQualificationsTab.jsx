import React from 'react';
import {
  SchoolOutlined,
  TrendingUp,
  WorkspacePremiumOutlined,
  DescriptionOutlined
} from '@mui/icons-material';

export default function StaffQualificationsTab({ staff }) {
  // Parse skills string into array of tags
  const skillsList = staff.skills
    ? staff.skills.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Education & Experience */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <SchoolOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-900">Education & Background</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Highest Education
                </span>
                <span className="text-sm font-black text-gray-800">
                  {staff.education || 'High School / Secondary'}
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">Formal academic qualification</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Years of Experience
                </span>
                <span className="text-sm font-black text-gray-800">
                  {staff.experience ? `${staff.experience} Years in Hospitality / Service` : 'Entry Level / Trainee'}
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">Verified track record</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Certifications + Notes */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <WorkspacePremiumOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
              <h3 className="text-sm font-bold text-gray-900">Skills & Certifications</h3>
            </div>

            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-50 text-[#1b7f43] border border-emerald-200/80 rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-2">
                No specific certifications or skills tagged for this profile.
              </p>
            )}
          </div>

          {/* HR Internal Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
              <DescriptionOutlined className="text-[#1b7f43]" sx={{ fontSize: 18 }} />
              <h3 className="text-sm font-bold text-gray-900">HR Notes & Additional Remarks</h3>
            </div>
            {staff.notes ? (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                {staff.notes}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No additional HR remarks recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
