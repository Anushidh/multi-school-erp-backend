import Joi from "joi";

export const createSchoolSchema = Joi.object({
  name: Joi.string().min(3).required(),
});
