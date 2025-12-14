import School from "../models/School.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { AppError } from "../utils/AppError.util.js";

export const createSchool = catchAsync(async (req, res) => {
  const { name } = req.body;

  const school = await School.create({ name });

  res.status(201).json(school);
});

export const getAllSchools = catchAsync(async (req, res) => {
  const schools = await School.findAll();
  res.json(schools);
});

export const getSchoolById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const school = await School.findByPk(id);
  if (!school) {
    throw new AppError("School not found", 404);
  }

  res.json(school);
});
