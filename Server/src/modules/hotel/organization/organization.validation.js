import Joi from "joi";

export const createDepartmentSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(30).required(),
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(500).allow(""),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
});

export const updateDepartmentSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(30),
  name: Joi.string().trim().max(100),
  description: Joi.string().max(500).allow(""),
  status: Joi.string().valid('ACTIVE', 'INACTIVE')
}).min(1);

export const createEmployeeSchema = Joi.object({
  employee_ref: Joi.string().trim().uppercase().max(30).required(),
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().trim().lowercase().max(150).required(),
  phone: Joi.string().trim().max(30).allow(""),
  department_id: Joi.string().hex().length(24).required(),
  job_title: Joi.string().trim().max(100).required(),
  status: Joi.string().valid('ACTIVE', 'ON_LEAVE', 'TERMINATED'),

  address: Joi.string().trim().max(300).allow("", null),
  dob: Joi.string().trim().max(30).allow("", null),
  gender: Joi.string().trim().max(30).allow("", null),
  nationality: Joi.string().trim().max(50).allow("", null),
  marital_status: Joi.string().trim().max(30).allow("", null),
  languages: Joi.string().trim().max(150).allow("", null),
  alt_phone: Joi.string().trim().max(30).allow("", null),
  joining_date: Joi.string().trim().max(30).allow("", null),
  employment_type: Joi.string().trim().max(50).allow("", null),
  shift: Joi.string().trim().max(50).allow("", null),
  salary: Joi.number().min(0).allow(null),
  reports_to: Joi.string().trim().max(100).allow("", null),
  experience: Joi.string().trim().max(500).allow("", null),
  education: Joi.string().trim().max(500).allow("", null),
  skills: Joi.string().trim().max(500).allow("", null),
  emergency_contact: Joi.object({
    name: Joi.string().trim().max(100).allow("", null),
    phone: Joi.string().trim().max(30).allow("", null),
    relation: Joi.string().trim().max(50).allow("", null),
  }).allow(null),
  notes: Joi.string().trim().max(1000).allow("", null),
  avatar: Joi.string().trim().max(500).allow("", null)
});

export const updateEmployeeSchema = Joi.object({
  employee_ref: Joi.string().trim().uppercase().max(30),
  first_name: Joi.string().trim().max(100),
  last_name: Joi.string().trim().max(100),
  email: Joi.string().email().trim().lowercase().max(150),
  phone: Joi.string().trim().max(30).allow(""),
  department_id: Joi.string().hex().length(24),
  job_title: Joi.string().trim().max(100),
  status: Joi.string().valid('ACTIVE', 'ON_LEAVE', 'TERMINATED'),

  address: Joi.string().trim().max(300).allow("", null),
  dob: Joi.string().trim().max(30).allow("", null),
  gender: Joi.string().trim().max(30).allow("", null),
  nationality: Joi.string().trim().max(50).allow("", null),
  marital_status: Joi.string().trim().max(30).allow("", null),
  languages: Joi.string().trim().max(150).allow("", null),
  alt_phone: Joi.string().trim().max(30).allow("", null),
  joining_date: Joi.string().trim().max(30).allow("", null),
  employment_type: Joi.string().trim().max(50).allow("", null),
  shift: Joi.string().trim().max(50).allow("", null),
  salary: Joi.number().min(0).allow(null),
  reports_to: Joi.string().trim().max(100).allow("", null),
  experience: Joi.string().trim().max(500).allow("", null),
  education: Joi.string().trim().max(500).allow("", null),
  skills: Joi.string().trim().max(500).allow("", null),
  emergency_contact: Joi.object({
    name: Joi.string().trim().max(100).allow("", null),
    phone: Joi.string().trim().max(30).allow("", null),
    relation: Joi.string().trim().max(50).allow("", null),
  }).allow(null),
  notes: Joi.string().trim().max(1000).allow("", null),
  avatar: Joi.string().trim().max(500).allow("", null)
}).min(1);
