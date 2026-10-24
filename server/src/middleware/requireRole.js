import { forbidden } from "../utils/httpError.js";

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw forbidden("You do not have access to this resource");
    }
    next();
  };
