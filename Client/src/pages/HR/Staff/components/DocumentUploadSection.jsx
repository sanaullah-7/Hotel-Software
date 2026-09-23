import React from 'react';
import {
  TextField,
  IconButton
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

import {
  SectionHeader,
  multilineStyle
} from './staffFormStyles';

export default function DocumentUploadSection({
  uploadedFiles = [],
  isDragging = false,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  fileInputRef,
  formData,
  onChange
}) {
  return (
    <>
      <SectionHeader
        icon={DescriptionOutlinedIcon}
        title="Additional Details"
        badgeBg="#faf5ff"
        iconColor="#a855f7"
      />

      <div className="space-y-4">
        {/* Profile Photo & Identification Documents (Dropzone) */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Profile Photo &amp; Identification Documents
          </label>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={onFileSelect}
          />

          {/* Drag and drop box - Compact */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#5d5fef] bg-[#5d5fef]/5 scale-[1.005]'
                : 'border-gray-300/80 bg-gray-50/60 hover:bg-gray-50 hover:border-[#5d5fef]/60'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-1.5 rounded-full border border-gray-300/90 text-[#5d5fef] font-medium text-xs sm:text-sm bg-white hover:bg-[#5d5fef]/5 hover:border-[#5d5fef] shadow-sm transition-all"
            >
              Choose file
            </button>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
              <CloudUploadIcon sx={{ fontSize: 19, color: '#94a3b8' }} />
              <span>or drag and drop file here</span>
            </div>
          </div>

          {/* Uploaded Files Preview List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {uploadedFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-9 h-9 object-cover rounded-md border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-400">{item.size}</p>
                    </div>
                  </div>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(item.id);
                    }}
                    sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fee2e2' } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            name="notes"
            placeholder="Additional notes or onboarding remarks..."
            value={formData.notes}
            onChange={onChange}
            sx={multilineStyle}
          />
        </div>
      </div>
    </>
  );
}
