import School from "../models/School.js";

export const createSchool = async (req, res) => {
  const { name } = req.body;

  const school = await School.create({ name });

  res.status(201).json(school);
};

export const getAllSchools = async (req, res) => {
  const schools = await School.findAll();
  res.json(schools);
};

export const getSchoolById = async (req, res) => {
  const { id } = req.params;

  const school = await School.findByPk(id);
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }

  res.json(school);
};
