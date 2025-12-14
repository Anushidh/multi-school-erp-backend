import { AppError } from "../utils/AppError.util.js";

export default (schema) => (req, res, next) => {
  
  const { error } = schema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  next();
};
