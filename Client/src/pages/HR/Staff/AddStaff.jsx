import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Snackbar
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CloseIcon from '@mui/icons-material/Close';

import staffService from '../../../features/staff/services/staffService';
import staffAdapter from '../../../features/staff/adapters/staffAdapter';
import { fileService } from '../../../services/fileService';
import { generateEmployeeId } from './components/staffFormStyles';
import PersonalInfoSection from './components/PersonalInfoSection';
import EmploymentDetailsSection from './components/EmploymentDetailsSection';
import ContactDetailsSection from './components/ContactDetailsSection';
import EducationSection from './components/EducationSection';
import DocumentUploadSection from './components/DocumentUploadSection';

import '../../../features/assigned-ui/formStyles.css';

export default function AddStaff() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Focus states for date inputs
  const [dobFocused, setDobFocused] = useState(false);
  const [joiningFocused, setJoiningFocused] = useState(false);

  // Departments loaded from backend
  const [departments, setDepartments] = useState([]);

  // Form State matching all Luxuria fields
  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    fullName: '',
    empId: generateEmployeeId(),
    gender: '',
    dob: '',
    nationality: '',
    maritalStatus: '',
    languages: '',

    // Section 2: Employment & Role
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    empType: '',
    shift: '',
    salary: '',
    employmentStatus: 'Active',
    reportsTo: '',

    // Section 3: Contact Information
    mobile: '',
    altPhone: '',
    email: '',
    address: '',

    // Section 4: Professional Qualifications
    experience: '',
    education: '',
    skills: '',

    // Section 5: Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',

    // Section 6: Additional Details
    notes: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDepartments = async () => {
      try {
        const res = await staffService.getDepartments();
        if (isMounted && res?.data) {
          const depts = res.data;
          setDepartments(depts);
          if (depts.length > 0 && !formData.department) {
            setFormData((prev) => ({ ...prev, department: depts[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load departments from backend:', err);
      }
    };
    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle standard input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Regenerate Employee ID
  const handleRegenerateId = () => {
    setFormData((prev) => ({ ...prev, empId: generateEmployeeId() }));
  };

  // Handle department created on-the-fly
  const handleDepartmentAdded = (newDept) => {
    if (!newDept) return;
    setDepartments((prev) => {
      const exists = prev.some((d) => d._id === newDept._id);
      if (exists) return prev;
      return [...prev, newDept].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    setFormData((prev) => ({ ...prev, department: newDept._id }));
    if (formErrors.department) {
      setFormErrors((prev) => ({ ...prev, department: null }));
    }
    setSnackbar({
      open: true,
      message: `Department "${newDept.name}" created and selected!`,
      severity: 'success'
    });
  };

  // File Upload Handlers
  const processFiles = async (files) => {
    const newFiles = files.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isUploading: true,
      url: null,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (const item of newFiles) {
      try {
        const res = await fileService.uploadFile(item.file, { folder: 'staff', entity_ref: 'STAFF_DOCUMENT' });
        if (res?.file_url) {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, isUploading: false, url: res.file_url } : f))
          );
          if (item.type.startsWith('image/')) {
            setFormData((prev) => ({ ...prev, avatar: res.file_url }));
          }
        }
      } catch (err) {
        console.warn('Staff file upload failed:', err);
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, isUploading: false } : f))
        );
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Form Validation & Submit
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!formData.designation || !formData.designation.trim()) {
      errors.designation = 'Designation is required';
    }
    if (!formData.department || !formData.department.trim()) {
      errors.department = 'Department is required';
    }
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please complete all required fields (Full Name, Designation, Department, Email).',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = staffAdapter.toBackendCreatePayload(formData);
      const res = await staffService.createEmployee(payload);
      const created = res?.data;
      const createdName = created?.first_name ? `${created.first_name} ${created.last_name || ''}`.trim() : formData.fullName;
      const createdRef = created?.employee_ref || formData.empId;

      setSnackbar({
        open: true,
        message: `Staff member "${createdName}" (${createdRef}) successfully registered!`,
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/hr/staff');
      }, 700);
    } catch (err) {
      console.error('Failed to create employee on server:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create employee on server';
      setSnackbar({
        open: true,
        message: errMsg,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assigned-form-surface p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden bg-[#f8fafc]">
      {/* Main White Card Container */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-2 sm:p-2.5">
        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-2">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <PersonalInfoSection
            formData={formData}
            formErrors={formErrors}
            onChange={handleInputChange}
            onRegenerateId={handleRegenerateId}
            dobFocused={dobFocused}
            setDobFocused={setDobFocused}
          />

          {/* SECTION 2: EMPLOYMENT & ROLE */}
          <EmploymentDetailsSection
            formData={formData}
            formErrors={formErrors}
            onChange={handleInputChange}
            joiningFocused={joiningFocused}
            setJoiningFocused={setJoiningFocused}
            departments={departments}
            onDepartmentAdded={handleDepartmentAdded}
          />

          {/* SECTION 3 & 5: CONTACT & EMERGENCY DETAILS */}
          <ContactDetailsSection
            formData={formData}
            formErrors={formErrors}
            onChange={handleInputChange}
          />

          {/* SECTION 4: PROFESSIONAL QUALIFICATIONS */}
          <EducationSection
            formData={formData}
            formErrors={formErrors}
            onChange={handleInputChange}
          />

          {/* SECTION 6: ADDITIONAL DETAILS & DOCUMENT UPLOAD */}
          <DocumentUploadSection
            uploadedFiles={uploadedFiles}
            isDragging={isDragging}
            onFileSelect={handleFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveFile={handleRemoveFile}
            fileInputRef={fileInputRef}
            formData={formData}
            onChange={handleInputChange}
          />

          {/* FORM FOOTER ACTION BUTTONS */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="assigned-primary-button inline-flex items-center justify-center gap-2 px-5 py-2 font-medium text-sm rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/hr/staff')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 transition-all duration-200 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: '#4b5563' }} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
