import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";

// Uniqueness: the UNIQUE index on `code` is the final guarantee. The pre-check only gives a
// friendlier message; a concurrent duplicate raises E11000 which the error handler maps to 409.
export const createDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");

  const existing = await Department.findOne({ code: req.body.code });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Department with this code already exists");
  }

  const department = await Department.create(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, department, "Department created successfully"));
});

export const DEFAULT_DEPARTMENTS = [
  { name: "Front Office / Reception", code: "FD", description: "Front desk, reservations, and guest reception" },
  { name: "Housekeeping", code: "HK", description: "Room cleaning, laundry, and property hygiene" },
  { name: "Food & Beverage / Kitchen", code: "FB", description: "Restaurant, kitchen, bar, and room service" },
  { name: "Maintenance & Engineering", code: "MNT", description: "Facility maintenance, repairs, and utilities" },
  { name: "Security", code: "SEC", description: "Guest safety, property security, and surveillance" },
  { name: "Human Resources", code: "HR", description: "Staff recruitment, payroll, and employee relations" },
  { name: "Finance & Accounts", code: "ACC", description: "Accounting, billing, and financial reporting" },
  { name: "Management", code: "MGT", description: "Executive and administrative management" }
];

export const getDepartments = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const count = await Department.countDocuments();
  if (count === 0) {
    try {
      await Department.insertMany(DEFAULT_DEPARTMENTS, { ordered: false });
    } catch {
      // Ignore duplicate key errors if a concurrent request seeded it
    }
  }
  const departments = await Department.find({ status: 'ACTIVE' }).sort({ name: 1 });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, departments, "Departments retrieved successfully"));
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, department, "Department retrieved successfully"));
});

const assertNoActiveEmployees = async (hotelContext, departmentId) => {
  const Employee = await getModel(hotelContext, "Employee");
  const count = await Employee.countDocuments({ department_id: departmentId, status: { $ne: "TERMINATED" } });
  if (count > 0) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Department still has active employees");
  }
};

export const updateDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");

  if (req.body.status === "INACTIVE") {
    await assertNoActiveEmployees(req.hotelContext, req.params.id);
  }

  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, department, "Department updated successfully"));
});

// Business rule: departments are SOFT-deleted (status -> INACTIVE) so employee history stays
// intact. A department with non-terminated employees cannot be removed.
export const deleteDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const existing = await Department.findById(req.params.id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }
  await assertNoActiveEmployees(req.hotelContext, req.params.id);

  existing.status = "INACTIVE";
  await existing.save();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Department deactivated successfully"));
});
