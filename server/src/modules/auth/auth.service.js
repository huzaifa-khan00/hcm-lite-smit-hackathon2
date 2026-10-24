import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "./user.model.js";
import { unauthorized, badRequest } from "../../utils/httpError.js";

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  employeeId: u.employeeId,
  mustChangePassword: u.mustChangePassword,
});

const signToken = (u) =>
  jwt.sign(
    { id: u._id, role: u.role, employeeId: u.employeeId },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) throw unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized("Invalid email or password");

  return { token: signToken(user), user: publicUser(user) };
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw unauthorized();
  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) throw unauthorized();

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw badRequest("Current password is incorrect");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.mustChangePassword = false;
  await user.save();
}
