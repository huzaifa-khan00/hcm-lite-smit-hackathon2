import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../modules/auth/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { unauthorized } from "../utils/httpError.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw unauthorized("Missing token");

  const payload = jwt.verify(header.slice(7), env.jwtSecret);
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw unauthorized("Account is not active");

  req.user = {
    id: user._id.toString(),
    role: user.role,
    employeeId: user.employeeId,
    mustChangePassword: user.mustChangePassword,
  };
  next();
});
