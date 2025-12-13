import Student from "../models/Student.js";

const checkSchoolAccess = (req, schoolId) => {
  if (req.user.role === "superadmin") return true;
  return Number(req.user.schoolId) === Number(schoolId);
};

const canWrite = (req) => {
  return (
    req.user.role === "superadmin" ||
    req.user.role === "admin" ||
    req.user.canEditStudents === true
  );
};

export const createStudent = async (req, res) => {
  const { schoolId } = req.params;

  if (!checkSchoolAccess(req, schoolId)) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  if (!canWrite(req)) {
    return res.status(403).json({ message: "No edit permission" });
  }

  const student = await Student.create({
    ...req.body,
    schoolId,
    createdBy: req.user.userId,
  });

  res.status(201).json(student);
};

export const getStudents = async (req, res) => {
  const { schoolId } = req.params;

  if (!checkSchoolAccess(req, schoolId)) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  const students = await Student.findAll({
    where: { schoolId },
  });

  res.json(students);
};

export const getStudentById = async (req, res) => {
  const { schoolId, id } = req.params;

  if (!checkSchoolAccess(req, schoolId)) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  const student = await Student.findOne({
    where: { id, schoolId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
};

export const updateStudent = async (req, res) => {
  const { schoolId, id } = req.params;

  if (!checkSchoolAccess(req, schoolId)) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  if (!canWrite(req)) {
    return res.status(403).json({ message: "No edit permission" });
  }

  const student = await Student.findOne({
    where: { id, schoolId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await student.update(req.body);

  res.json({ message: "Student updated" });
};

export const deleteStudent = async (req, res) => {
  const { schoolId, id } = req.params;

  if (!checkSchoolAccess(req, schoolId)) {
    return res.status(403).json({ message: "Cross-school access denied" });
  }

  if (!canWrite(req)) {
    return res.status(403).json({ message: "No edit permission" });
  }

  const student = await Student.findOne({
    where: { id, schoolId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await student.destroy();

  res.json({ message: "Student deleted" });
};
