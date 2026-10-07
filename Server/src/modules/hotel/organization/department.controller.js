import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";

// Uniqueness: the UNIQUE index on `hotelId + code` is the final guarantee.
export const createDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");

  const existing = await Department.findOne({ code: req.body.code, hotelId: req.hotelContext });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Department with this code already exists in this hotel");
  }

  const departmentData = { ...req.body, hotelId: req.hotelContext };
  const department = await Department.create(departmentData);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, department, "Department created successfully"));
});

export const getDepartments = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const departments = await Department.find({ hotelId: req.hotelContext, status: 'ACTIVE' }).sort({ name: 1 });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, departments, "Departments retrieved successfully"));
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const department = await Department.findOne({ _id: req.params.id, hotelId: req.hotelContext });

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, department, "Department retrieved successfully"));
});

const assertNoActiveEmployees = async (hotelContext, departmentId) => {
  const Employee = await getModel(hotelContext, "Employee");
  const count = await Employee.countDocuments({ department_id: departmentId, hotelId: hotelContext, status: { $ne: "TERMINATED" } });
  if (count > 0) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Department still has active employees");
  }
};

export const updateDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");

  if (req.body.status === "INACTIVE") {
    await assertNoActiveEmployees(req.hotelContext, req.params.id);
  }

  const updateData = { ...req.body };
  delete updateData.hotelId;

  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, hotelId: req.hotelContext },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, department, "Department updated successfully"));
});

// Business rule: departments are SOFT-deleted (status -> INACTIVE) so employee history stays
// intact. A department with non-terminated employees cannot be removed.
export const deleteDepartment = asyncHandler(async (req, res) => {
  const Department = await getModel(req.hotelContext, "Department");
  const existing = await Department.findOne({ _id: req.params.id, hotelId: req.hotelContext });
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }
  await assertNoActiveEmployees(req.hotelContext, req.params.id);

  existing.status = "INACTIVE";
  await existing.save();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Department deactivated successfully"));
});
