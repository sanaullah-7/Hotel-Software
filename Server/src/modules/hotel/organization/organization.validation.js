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
  status: Joi.string().valid('ACTIVE', 'ON_LEAVE', 'TERMINATED')
});

export const updateEmployeeSchema = Joi.object({
  first_name: Joi.string().trim().max(100),
  last_name: Joi.string().trim().max(100),
  email: Joi.string().email().trim().lowercase().max(150),
  phone: Joi.string().trim().max(30).allow(""),
  department_id: Joi.string().hex().length(24),
  job_title: Joi.string().trim().max(100),
  status: Joi.string().valid('ACTIVE', 'ON_LEAVE', 'TERMINATED')
}).min(1);
