import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";
import { parsePagination, objectIdQuery, asString } from "../../../utils/query.js";

const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "TERMINATED"];

// Cross-tenant protection: the reference must exist in THIS tenant's database
// (the model is bound to the authenticated hotel's connection).
const assertDepartmentInTenant = async (hotelContext, departmentId) => {
  const Department = await getModel(hotelContext, "Department");
  const dept = await Department.findById(departmentId);
  if (!dept) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced department does not exist in this hotel");
  }
};

export const createEmployee = asyncHandler(async (req, res) => {
  const Employee = await getModel(req.hotelContext, "Employee");

  const existing = await Employee.findOne({ employee_ref: req.body.employee_ref });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Employee with this ID already exists");
  }

  await assertDepartmentInTenant(req.hotelContext, req.body.department_id);

  const employee = await Employee.create(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, employee, "Employee created successfully"));
});

export const getEmployees = asyncHandler(async (req, res) => {
  const Employee = await getModel(req.hotelContext, "Employee");
  const { page, limit, skip } = parsePagination(req.query);

  const query = {};
  const status = asString(req.query.status);
  if (status) {
    if (!EMPLOYEE_STATUSES.includes(status)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid status filter");
    }
    query.status = status;
  } else {
    // Default listing hides terminated employees (they stay retrievable by id / status filter)
    query.status = { $ne: "TERMINATED" };
  }
  const departmentId = objectIdQuery(req.query.department_id, "department_id");
  if (departmentId) query.department_id = departmentId;

  const employees = await Employee.find(query).populate('department_id').skip(skip).limit(limit).sort({ created_at: -1, _id: -1 });
  const total = await Employee.countDocuments(query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, employees, "Employees retrieved successfully", { page, limit, total }));
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const Employee = await getModel(req.hotelContext, "Employee");
  const employee = await Employee.findById(req.params.id).populate('department_id');

  if (!employee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, employee, "Employee retrieved successfully"));
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const Employee = await getModel(req.hotelContext, "Employee");

  if (req.body.department_id) {
    await assertDepartmentInTenant(req.hotelContext, req.body.department_id);
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });

  if (!employee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, employee, "Employee updated successfully"));
});

// Business rule: employees are SOFT-deleted (status -> TERMINATED) to preserve HR history.
export const deleteEmployee = asyncHandler(async (req, res) => {
  const Employee = await getModel(req.hotelContext, "Employee");
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: "TERMINATED" },
    { returnDocument: "after", runValidators: true }
  );
  if (!employee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found");
  }
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Employee terminated successfully"));
});
