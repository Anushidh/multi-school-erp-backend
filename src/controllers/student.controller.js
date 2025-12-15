import Student from "../models/Student.js";
import { catchAsync } from "../utils/catchAsync.util.js";
import { AppError } from "../utils/AppError.util.js";
import AuditLog from "../models/AuditLog.js";


export const createStudent = catchAsync(async (req, res) => {
  const { schoolId } = req.params;

  const student = await Student.create({
    ...req.body,
    schoolId,
    createdBy: req.user.userId,
  });
  await AuditLog.create({
    actorId: req.user.userId,
    entity: "Student",
    entityId: student.id,
    action: "CREATE",
    before: null,
    after: student.toJSON(),
  });
  res.status(201).json(student);
});


export const getStudents = catchAsync(async (req, res) => {
  const { schoolId } = req.params;

  const students = await Student.findAll({
    where: { schoolId, isDeleted: false },
  });

  res.json(students);
});


export const getStudentById = catchAsync(async (req, res) => {
  const { schoolId, id } = req.params;

  const student = await Student.findOne({
    where: { id, schoolId, isDeleted: false },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  res.json(student);
});


export const updateStudent = catchAsync(async (req, res) => {
  const { schoolId, id } = req.params;

  const student = await Student.findOne({
    where: { id, schoolId, isDeleted: false },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }
  const before = student.toJSON();

  await student.update(req.body);

  await AuditLog.create({
    actorId: req.user.userId,
    entity: "Student",
    entityId: student.id,
    action: "UPDATE",
    before,
    after: student.toJSON(),
  });

  res.json({
    message: "Student updated successfully",
  });
});


export const deleteStudent = catchAsync(async (req, res) => {
  const { schoolId, id } = req.params;

  const student = await Student.findOne({
    where: { id, schoolId, isDeleted: false },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }
  const before = student.toJSON();
  // await student.destroy();
  await student.update({ isDeleted: true });

  await AuditLog.create({
    actorId: req.user.userId,
    entity: "Student",
    entityId: student.id,
    action: "DELETE",
    before,
    after: { isDeleted: true },
  });
  res.json({
    message: "Student deleted successfully",
  });
});
