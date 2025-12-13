import Joi from "joi";

export const createStudentSchema = Joi.object({
  name: Joi.string().required(),
  dob: Joi.date().required(),
});

export const updateStudentSchema = Joi.object({
  name: Joi.string(),
  dob: Joi.date(),
});
