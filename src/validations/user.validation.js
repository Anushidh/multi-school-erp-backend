import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  role: Joi.string().valid("admin", "user").required(),
  canEditStudents: Joi.boolean(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string(),
  canEditStudents: Joi.boolean(),
});
